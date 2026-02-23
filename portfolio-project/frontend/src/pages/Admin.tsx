import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../services/api';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { skillService } from '../services/skillService';
import { experienceService } from '../services/experienceService';
import { contactService, ContactMessageResponse } from '../services/contactService';
import { technologyService, Technology } from '../services/technologyService';
import type { Skill, Experience } from '../services/types';
import {
  defaultExperienceFormValues,
  defaultProjectFormValues,
  defaultSkillFormValues,
  ExperienceForm,
  ExperienceFormValues,
  ProjectForm,
  ProjectFormValues,
  ProjectImage,
  ProjectTranslationData,
  SkillForm,
  SkillFormValues,
  TranslationEditor,
  AdminLanguage,
} from '../components/admin/AdminForms';

interface Stats {
  projects: number;
  skills: number;
  experiences: number;
  messages: number;
  unreadMessages: number;
}

interface AdminProject {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  featured: boolean;
  displayOrder: number;
  updatedAt: string | null;
  createdAt: string | null;
  technologies?: Array<{ id: string; name: string; slug: string }>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusableElements = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      window.getComputedStyle(element).display !== 'none' &&
      window.getComputedStyle(element).visibility !== 'hidden',
  );

function formatDate(value: string | null, locale: string): string {
  if (!value) {
    return '—';
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    console.error('Failed to format date:', error);
    return '—';
  }
}

export default function Admin() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const adminLanguage: AdminLanguage = language === 'tr' ? 'tr' : 'en';
  const dateLocale = adminLanguage === 'tr' ? 'tr-TR' : 'en-US';
  const text = {
    loading: adminLanguage === 'tr' ? 'Yukleniyor...' : 'Loading...',
    adminPanel: adminLanguage === 'tr' ? 'Admin Panel' : 'Admin Panel',
    welcome: adminLanguage === 'tr' ? 'Hos geldin' : 'Welcome',
    logout: adminLanguage === 'tr' ? 'Cikis Yap' : 'Log Out',
    dashboard: adminLanguage === 'tr' ? 'Dashboard' : 'Dashboard',
    projects: adminLanguage === 'tr' ? 'Projeler' : 'Projects',
    skills: adminLanguage === 'tr' ? 'Beceriler' : 'Skills',
    experiences: adminLanguage === 'tr' ? 'Deneyimler' : 'Experiences',
    messages: adminLanguage === 'tr' ? 'Mesajlar' : 'Messages',
    yes: adminLanguage === 'tr' ? 'Evet' : 'Yes',
    no: adminLanguage === 'tr' ? 'Hayir' : 'No',
    unreadSuffix: adminLanguage === 'tr' ? 'okunmamis' : 'unread',
    allViewed: adminLanguage === 'tr' ? 'Tumu goruntulendi' : 'All viewed',
    welcomeUser: adminLanguage === 'tr' ? 'Hos geldin' : 'Welcome',
    projectManagement: adminLanguage === 'tr' ? 'Projeler Yonetimi' : 'Projects Management',
    skillManagement: adminLanguage === 'tr' ? 'Beceriler Yonetimi' : 'Skills Management',
    experienceManagement: adminLanguage === 'tr' ? 'Deneyimler Yonetimi' : 'Experiences Management',
    incomingMessages: adminLanguage === 'tr' ? 'Gelen Mesajlar' : 'Incoming Messages',
    addProject: adminLanguage === 'tr' ? '+ Yeni Proje Ekle' : '+ Add New Project',
    addSkill: adminLanguage === 'tr' ? '+ Yeni Beceri Ekle' : '+ Add New Skill',
    addExperience: adminLanguage === 'tr' ? '+ Yeni Deneyim Ekle' : '+ Add New Experience',
    edit: adminLanguage === 'tr' ? 'Duzenle' : 'Edit',
    delete: adminLanguage === 'tr' ? 'Sil' : 'Delete',
    deleting: adminLanguage === 'tr' ? 'Siliniyor...' : 'Deleting...',
    translate: adminLanguage === 'tr' ? 'Ceviriler' : 'Translations',
    images: adminLanguage === 'tr' ? 'Resimler' : 'Images',
    sessionExpired:
      adminLanguage === 'tr'
        ? 'Oturum sureniz doldu. Lutfen tekrar giris yapin.'
        : 'Your session has expired. Please sign in again.',
  };

  const [stats, setStats] = useState<Stats>({
    projects: 0,
    skills: 0,
    experiences: 0,
    messages: 0,
    unreadMessages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectFormMode, setProjectFormMode] = useState<'create' | 'edit'>('create');
  const [projectFormValues, setProjectFormValues] = useState<ProjectFormValues>({
    ...defaultProjectFormValues,
  });
  const [projectFormSubmitting, setProjectFormSubmitting] = useState(false);
  const [activeProject, setActiveProject] = useState<AdminProject | null>(null);
  const [projectActionId, setProjectActionId] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingTechnologies, setLoadingTechnologies] = useState(false);

  // Image Manager state
  const [imageManagerOpen, setImageManagerOpen] = useState(false);
  const [currentProjectForImages, setCurrentProjectForImages] = useState<AdminProject | null>(null);
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Translation Manager state
  const [translationModalOpen, setTranslationModalOpen] = useState(false);
  const [currentProjectForTranslations, setCurrentProjectForTranslations] = useState<AdminProject | null>(null);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [currentTranslations, setCurrentTranslations] = useState<Record<string, ProjectTranslationData>>({});

  // Skills state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillFormMode, setSkillFormMode] = useState<'create' | 'edit'>('create');
  const [skillFormValues, setSkillFormValues] = useState<SkillFormValues>({
    ...defaultSkillFormValues,
  });
  const [skillFormSubmitting, setSkillFormSubmitting] = useState(false);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  // Experiences state
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [experienceFormMode, setExperienceFormMode] = useState<'create' | 'edit'>('create');
  const [experienceFormValues, setExperienceFormValues] = useState<ExperienceFormValues>({
    ...defaultExperienceFormValues,
  });
  const [experienceFormSubmitting, setExperienceFormSubmitting] = useState(false);
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null);

  // Messages state
  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageActionId, setMessageActionId] = useState<string | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const projectModalRef = useRef<HTMLDivElement>(null);
  const skillModalRef = useRef<HTMLDivElement>(null);
  const experienceModalRef = useRef<HTMLDivElement>(null);
  const imageManagerModalRef = useRef<HTMLDivElement>(null);
  const translationModalRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleApiError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      console.error(fallbackMessage, error);

      const isAxiosError =
        typeof error === 'object' &&
        error !== null &&
        (error as AxiosError).isAxiosError === true;

      if (isAxiosError) {
        const typedError = error as AxiosError<{ detail?: unknown }>;
        const status = typedError.response?.status;

        if (status === 401 || status === 403) {
          showToast('error', text.sessionExpired);
          handleLogout();
          return;
        }

        const detail = typedError.response?.data?.detail;
        if (typeof detail === 'string') {
          showToast('error', detail);
          return;
        }

        if (Array.isArray(detail) && detail.length > 0) {
          const firstMessage = detail[0]?.msg || fallbackMessage;
          showToast('error', firstMessage);
          return;
        }
      }

      showToast('error', fallbackMessage);
    },
    [handleLogout, showToast, text.sessionExpired],
  );

  const loadStats = useCallback(
    async (initial = false) => {
      if (initial) {
        setLoading(true);
      } else {
        setStatsLoading(true);
      }

      try {
        const response = await api.get('/admin/stats');
        const data = response.data ?? {};

        setStats({
          projects: Number(data.projects) || 0,
          skills: Number(data.skills) || 0,
          experiences: Number(data.experiences) || 0,
          messages: Number(data.messages) || 0,
          unreadMessages: Number(data.unread_messages) || 0,
        });
      } catch (error) {
        handleApiError(error, 'Admin istatistikleri yüklenirken bir hata oluştu.');
      } finally {
        if (initial) {
          setLoading(false);
        } else {
          setStatsLoading(false);
        }
      }
    },
    [handleApiError],
  );

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);

    try {
      const response = await api.get('/projects/', {
        params: {
          limit: 100,
          skip: 0,
        },
      });

      const items = Array.isArray(response.data?.items) ? response.data.items : [];

      const mappedProjects: AdminProject[] = items.map((project: Record<string, unknown>) => ({
        id: project.id as string,
        title: (project.title as string) ?? '',
        slug: (project.slug as string) ?? '',
        shortDescription: (project.short_description as string) ?? '',
        description: (project.description as string) ?? '',
        coverImage: (project.cover_image as string | null) ?? null,
        githubUrl: (project.github_url as string | null) ?? null,
        demoUrl: (project.demo_url as string | null) ?? null,
        featured: Boolean(project.featured),
        displayOrder: typeof project.display_order === 'number' ? project.display_order : Number(project.display_order) || 0,
        updatedAt: (project.updated_at as string | null) ?? null,
        createdAt: (project.created_at as string | null) ?? null,
        technologies: (project.technologies as Array<{ id: string; name: string; slug: string }>) || [],
      }));

      setProjects(mappedProjects);
    } catch (error) {
      handleApiError(error, 'Projeler yüklenirken bir hata oluştu.');
    } finally {
      setProjectsLoading(false);
    }
  }, [handleApiError]);

  const loadTechnologies = useCallback(async () => {
    setLoadingTechnologies(true);
    try {
      const techs = await technologyService.getAll();
      setTechnologies(techs);
    } catch (error) {
      handleApiError(error, adminLanguage === 'tr' ? 'Teknolojiler yuklenemedi.' : 'Failed to load technologies.');
    } finally {
      setLoadingTechnologies(false);
    }
  }, [adminLanguage, handleApiError]);

  const loadSkills = useCallback(async () => {
    setSkillsLoading(true);
    try {
      const skillsData = await skillService.getSkills();
      setSkills(skillsData);
    } catch (error) {
      handleApiError(error, 'Beceriler yüklenirken bir hata oluştu.');
    } finally {
      setSkillsLoading(false);
    }
  }, [handleApiError]);

  const loadExperiences = useCallback(async () => {
    setExperiencesLoading(true);
    try {
      const experiencesData = await experienceService.getExperiences({ limit: 100 });
      setExperiences(Array.isArray(experiencesData) ? experiencesData : []);
    } catch (error) {
      handleApiError(error, 'Deneyimler yüklenirken bir hata oluştu.');
    } finally {
      setExperiencesLoading(false);
    }
  }, [handleApiError]);

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const messagesData = await contactService.getMessages({ limit: 100 });
      setMessages(messagesData.messages);
    } catch (error) {
      handleApiError(error, 'Mesajlar yüklenirken bir hata oluştu.');
    } finally {
      setMessagesLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    loadStats(true);
  }, [loadStats]);

  useEffect(() => {
    void loadTechnologies();
  }, [loadTechnologies]);

  useEffect(() => {
    if (activeTab === 'projects') {
      loadProjects();
    } else if (activeTab === 'skills') {
      loadSkills();
    } else if (activeTab === 'experiences') {
      loadExperiences();
    } else if (activeTab === 'messages') {
      loadMessages();
    }
  }, [activeTab, loadProjects, loadSkills, loadExperiences, loadMessages]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (translationModalOpen) {
        setTranslationModalOpen(false);
        setCurrentProjectForTranslations(null);
        setCurrentTranslations({});
        return;
      }

      if (imageManagerOpen) {
        setImageManagerOpen(false);
        setCurrentProjectForImages(null);
        setProjectImages([]);
        setUploadProgress(0);
        return;
      }

      if (experienceModalOpen) {
        if (!experienceFormSubmitting) {
          setExperienceModalOpen(false);
          setExperienceFormValues({ ...defaultExperienceFormValues });
          setActiveExperience(null);
        }
        return;
      }

      if (skillModalOpen) {
        if (!skillFormSubmitting) {
          setSkillModalOpen(false);
          setSkillFormValues({ ...defaultSkillFormValues });
          setActiveSkill(null);
        }
        return;
      }

      if (projectModalOpen) {
        if (!projectFormSubmitting) {
          setProjectModalOpen(false);
          setProjectFormValues({ ...defaultProjectFormValues });
          setActiveProject(null);
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [
    experienceFormSubmitting,
    experienceModalOpen,
    imageManagerOpen,
    projectFormSubmitting,
    projectModalOpen,
    skillFormSubmitting,
    skillModalOpen,
    translationModalOpen,
  ]);

  useEffect(() => {
    const anyModalOpen =
      projectModalOpen ||
      skillModalOpen ||
      experienceModalOpen ||
      imageManagerOpen ||
      translationModalOpen;

    if (!anyModalOpen) {
      previouslyFocusedElementRef.current?.focus();
      previouslyFocusedElementRef.current = null;
      return;
    }

    if (!previouslyFocusedElementRef.current) {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        previouslyFocusedElementRef.current = activeElement;
      }
    }

    const activeModal =
      (translationModalOpen && translationModalRef.current) ||
      (imageManagerOpen && imageManagerModalRef.current) ||
      (experienceModalOpen && experienceModalRef.current) ||
      (skillModalOpen && skillModalRef.current) ||
      (projectModalOpen && projectModalRef.current);

    if (!activeModal) {
      return;
    }

    const focusInitialElement = () => {
      const focusableElements = getFocusableElements(activeModal);
      (focusableElements[0] || activeModal).focus();
    };

    const animationFrameId = requestAnimationFrame(focusInitialElement);

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(activeModal);
      if (focusableElements.length === 0) {
        event.preventDefault();
        activeModal.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const currentActive = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!currentActive || currentActive === firstElement || !activeModal.contains(currentActive)) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (!currentActive || currentActive === lastElement || !activeModal.contains(currentActive)) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    activeModal.addEventListener('keydown', trapFocus);
    return () => {
      cancelAnimationFrame(animationFrameId);
      activeModal.removeEventListener('keydown', trapFocus);
    };
  }, [
    experienceModalOpen,
    imageManagerOpen,
    projectModalOpen,
    skillModalOpen,
    translationModalOpen,
  ]);

  const normalizeOptional = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const openCreateProjectModal = () => {
    setProjectFormMode('create');
    setActiveProject(null);
  setProjectFormValues({ ...defaultProjectFormValues });
    setProjectModalOpen(true);
  };

  const openEditProjectModal = (project: AdminProject) => {
    setProjectFormMode('edit');
    setActiveProject(project);
    setProjectFormValues({
      title: project.title ?? '',
      slug: project.slug ?? '',
      shortDescription: project.shortDescription ?? '',
      description: project.description ?? '',
      coverImage: project.coverImage ?? '',
      githubUrl: project.githubUrl ?? '',
      demoUrl: project.demoUrl ?? '',
      displayOrder: project.displayOrder ?? 0,
      featured: project.featured,
      technology_ids: project.technologies?.map((t) => t.id) ?? [],
    });
    setProjectModalOpen(true);
  };

  const closeProjectModal = (force = false) => {
    if (projectFormSubmitting && !force) {
      return;
    }
    setProjectModalOpen(false);
  setProjectFormValues({ ...defaultProjectFormValues });
    setActiveProject(null);
  };

  const handleProjectSubmit = async (values: ProjectFormValues) => {
    setProjectFormSubmitting(true);

    try {
      if (projectFormMode === 'create') {
        await api.post('/projects/', {
          title: values.title.trim(),
          slug: normalizeOptional(values.slug),
          short_description: normalizeOptional(values.shortDescription),
          description: values.description.trim(),
          cover_image: normalizeOptional(values.coverImage),
          github_url: normalizeOptional(values.githubUrl),
          demo_url: normalizeOptional(values.demoUrl),
          featured: values.featured,
          display_order: values.displayOrder,
        });

        showToast('success', 'Proje başarıyla oluşturuldu.');
      } else if (activeProject) {
        await api.put(`/projects/${activeProject.id}`, {
          title: values.title.trim(),
          short_description: normalizeOptional(values.shortDescription),
          description: values.description.trim(),
          cover_image: normalizeOptional(values.coverImage),
          github_url: normalizeOptional(values.githubUrl),
          demo_url: normalizeOptional(values.demoUrl),
          featured: values.featured,
          display_order: values.displayOrder,
        });

        showToast('success', 'Proje güncellendi.');
      }

  closeProjectModal(true);
      await loadProjects();
      await loadStats();
    } catch (error) {
      handleApiError(error, 'Proje kaydedilirken bir hata oluştu.');
    } finally {
      setProjectFormSubmitting(false);
    }
  };

  const handleDeleteProject = async (project: AdminProject) => {
    const confirmed = window.confirm(`"${project.title}" adlı projeyi silmek istediğinizden emin misiniz?`);
    if (!confirmed) {
      return;
    }

    setProjectActionId(project.id);

    try {
      await api.delete(`/projects/${project.id}`);
      showToast('success', 'Proje silindi.');
      await loadProjects();
      await loadStats();
    } catch (error) {
      handleApiError(error, 'Proje silinirken bir hata oluştu.');
    } finally {
      setProjectActionId(null);
    }
  };

  // Image Manager Functions
  const openImageManager = async (project: AdminProject) => {
    setCurrentProjectForImages(project);
    setImageManagerOpen(true);
    await loadProjectImages(project);
  };

  const closeImageManager = () => {
    setImageManagerOpen(false);
    setCurrentProjectForImages(null);
    setProjectImages([]);
    setUploadProgress(0);
  };

  const loadProjectImages = async (project: AdminProject) => {
    setImagesLoading(true);
    try {
      const response = await api.get(`/projects/${project.slug}`);
      const images = response.data?.images || [];
      setProjectImages(images.sort((a: ProjectImage, b: ProjectImage) => a.display_order - b.display_order));
    } catch (error) {
      handleApiError(error, 'Resimler yüklenirken hata oluştu.');
    } finally {
      setImagesLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!currentProjectForImages) return;

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (real progress requires axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await api.post(
        `/projects/${currentProjectForImages.id}/upload-image`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      showToast('success', 'Resim başarıyla yüklendi!');
  await loadProjectImages(currentProjectForImages);
      
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      handleApiError(error, 'Resim yüklenirken hata oluştu.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!currentProjectForImages) return;

    const confirmed = window.confirm('Bu resmi silmek istediğinizden emin misiniz?');
    if (!confirmed) return;

    try {
      await api.delete(`/projects/${currentProjectForImages.id}/images/${imageId}`);
      showToast('success', 'Resim silindi.');
  await loadProjectImages(currentProjectForImages);
    } catch (error) {
      handleApiError(error, 'Resim silinirken hata oluştu.');
    }
  };

  const handleUpdateImageCaption = async (imageId: string, caption: string) => {
    if (!currentProjectForImages) return;

    try {
      await api.put(
        `/projects/${currentProjectForImages.id}/images/${imageId}`,
        null,
        { params: { caption } }
      );
      showToast('success', 'Açıklama güncellendi.');
  await loadProjectImages(currentProjectForImages);
    } catch (error) {
      handleApiError(error, 'Açıklama güncellenirken hata oluştu.');
    }
  };

  const handleUpdateImageOrder = async (imageId: string, displayOrder: number) => {
    if (!currentProjectForImages) return;

    try {
      await api.put(
        `/projects/${currentProjectForImages.id}/images/${imageId}`,
        null,
        { params: { display_order: displayOrder } }
      );
  await loadProjectImages(currentProjectForImages);
    } catch (error) {
      handleApiError(error, 'Sıralama güncellenirken hata oluştu.');
    }
  };

  // Translation Modal Functions
  const openTranslationModal = async (project: AdminProject) => {
    setCurrentProjectForTranslations(project);
    setTranslationModalOpen(true);
  await loadProjectTranslations(project);
  };

  const closeTranslationModal = () => {
    setTranslationModalOpen(false);
    setCurrentProjectForTranslations(null);
    setCurrentTranslations({});
  };

  const loadProjectTranslations = async (project: AdminProject) => {
    setTranslationsLoading(true);
    try {
      const response = await api.get(`/projects/${project.slug}`);
      const translations = response.data?.translations || [];
      
      // Convert array to object keyed by language
      const translationsMap: Record<string, ProjectTranslationData> = {};
      translations.forEach((trans: ProjectTranslationData) => {
        translationsMap[trans.language] = trans;
      });
      
      setCurrentTranslations(translationsMap);
    } catch (error) {
      handleApiError(error, 'Çeviriler yüklenirken hata oluştu.');
    } finally {
      setTranslationsLoading(false);
    }
  };

  const handleSaveTranslation = async (language: string, data: Omit<ProjectTranslationData, 'language'>) => {
    if (!currentProjectForTranslations) return;

    try {
      await api.post(`/projects/${currentProjectForTranslations.id}/translations`, {
        language,
        title: data.title,
        short_description: data.short_description,
        description: data.description,
      });

      showToast('success', `${language.toUpperCase()} çevirisi kaydedildi.`);
  await loadProjectTranslations(currentProjectForTranslations);
    } catch (error) {
      handleApiError(error, 'Çeviri kaydedilirken hata oluştu.');
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    const confirmed = window.confirm('Bu beceriyi silmek istediğinizden emin misiniz?');
    if (!confirmed) {
      return;
    }

    try {
      await skillService.deleteSkill(skillId);
      showToast('success', 'Beceri silindi.');
      await loadSkills();
      await loadStats();
    } catch (error) {
      handleApiError(error, 'Beceri silinirken bir hata oluştu.');
    }
  };

  const openCreateSkillModal = () => {
    setSkillFormMode('create');
    setSkillFormValues({ ...defaultSkillFormValues });
    setActiveSkill(null);
    setSkillModalOpen(true);
  };

  const openEditSkillModal = (skill: Skill) => {
    setSkillFormMode('edit');
    setSkillFormValues({
      name: skill.name || '',
      category: skill.category || '',
      proficiency: skill.proficiency || 50,
      iconUrl: skill.icon_url || '',
    });
    setActiveSkill(skill);
    setSkillModalOpen(true);
  };

  const closeSkillModal = (reload = false) => {
    setSkillModalOpen(false);
    setSkillFormValues({ ...defaultSkillFormValues });
    setActiveSkill(null);
    if (reload) {
      void loadSkills();
      void loadStats();
    }
  };

  const handleSkillFormSubmit = async (values: SkillFormValues) => {
    setSkillFormSubmitting(true);

    try {
      if (skillFormMode === 'create') {
        await skillService.createSkill({
          name: values.name.trim(),
          category: values.category.trim(),
          proficiency: values.proficiency,
          icon_url: values.iconUrl.trim() || null,
        });

        showToast('success', 'Beceri başarıyla oluşturuldu.');
      } else if (activeSkill) {
        await skillService.updateSkill(activeSkill.id, {
          name: values.name.trim(),
          category: values.category.trim(),
          proficiency: values.proficiency,
          icon_url: values.iconUrl.trim() || null,
        });

        showToast('success', 'Beceri güncellendi.');
      }

      closeSkillModal(true);
      await loadSkills();
      await loadStats();
    } catch (error) {
      handleApiError(error, 'Beceri kaydedilirken bir hata oluştu.');
    } finally {
      setSkillFormSubmitting(false);
    }
  };

  const handleDeleteExperience = async (experienceId: string) => {
    const confirmed = window.confirm('Bu deneyimi silmek istediğinizden emin misiniz?');
    if (!confirmed) {
      return;
    }

    try {
      await experienceService.deleteExperience(experienceId);
      showToast('success', 'Deneyim silindi.');
      await loadExperiences();
      await loadStats();
    } catch (error) {
      handleApiError(error, 'Deneyim silinirken bir hata oluştu.');
    }
  };

  const openCreateExperienceModal = () => {
    setExperienceFormMode('create');
    setExperienceFormValues({ ...defaultExperienceFormValues });
    setActiveExperience(null);
    setExperienceModalOpen(true);
  };

  const openEditExperienceModal = (experience: Experience) => {
    setExperienceFormMode('edit');
    setExperienceFormValues({
      title: experience.title || '',
      organization: experience.organization || '',
      location: experience.location || '',
      experienceType: experience.experience_type || 'work',
      startDate: experience.start_date || '',
      endDate: experience.end_date || '',
      isCurrent: experience.is_current || false,
      description: experience.description || '',
    });
    setActiveExperience(experience);
    setExperienceModalOpen(true);
  };

  const closeExperienceModal = (reload = false) => {
    setExperienceModalOpen(false);
    setExperienceFormValues({ ...defaultExperienceFormValues });
    setActiveExperience(null);
    if (reload) {
      void loadExperiences();
      void loadStats();
    }
  };

  const handleExperienceFormSubmit = async (values: ExperienceFormValues) => {
    setExperienceFormSubmitting(true);

    try {
      if (experienceFormMode === 'create') {
        await experienceService.createExperience({
          title: values.title.trim(),
          organization: values.organization.trim(),
          location: values.location.trim() || undefined,
          experience_type: values.experienceType,
          start_date: values.startDate,
          end_date: values.isCurrent ? undefined : (values.endDate || undefined),
          is_current: values.isCurrent,
          description: values.description.trim() || undefined,
        });

        showToast('success', 'Deneyim başarıyla oluşturuldu.');
      } else if (activeExperience) {
        await experienceService.updateExperience(activeExperience.id, {
          title: values.title.trim(),
          organization: values.organization.trim(),
          location: values.location.trim() || undefined,
          experience_type: values.experienceType,
          start_date: values.startDate,
          end_date: values.isCurrent ? undefined : (values.endDate || undefined),
          is_current: values.isCurrent,
          description: values.description.trim() || undefined,
        });

        showToast('success', 'Deneyim güncellendi.');
      }

      closeExperienceModal(true);
      await loadExperiences();
      await loadStats();
    } catch (error) {
      handleApiError(error, 'Deneyim kaydedilirken bir hata oluştu.');
    } finally {
      setExperienceFormSubmitting(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    setMessageActionId(messageId);
    try {
      await contactService.markAsRead(messageId);
      showToast('success', 'Mesaj okundu olarak işaretlendi.');
      await loadMessages();
      await loadStats();
    } catch (error) {
      handleApiError(error, 'Mesaj güncellenirken bir hata oluştu.');
    } finally {
      setMessageActionId(null);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const confirmed = window.confirm('Bu mesajı silmek istediğinizden emin misiniz?');
    if (!confirmed) {
      return;
    }

    setMessageActionId(messageId);
    try {
      await contactService.deleteMessage(messageId);
      showToast('success', 'Mesaj silindi.');
      await loadMessages();
      await loadStats();
    } catch (error) {
      handleApiError(error, 'Mesaj silinirken bir hata oluştu.');
    } finally {
      setMessageActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-2xl text-gray-600 dark:text-gray-300">{text.loading}</div>
      </div>
    );
  }

  const statsCards = [
    {
      label: text.projects,
      value: stats.projects,
      icon: '📁',
      color: 'border-blue-500',
      delay: 0,
    },
    {
      label: text.skills,
      value: stats.skills,
      icon: '⚡',
      color: 'border-green-500',
      delay: 0.1,
    },
    {
      label: text.experiences,
      value: stats.experiences,
      icon: '💼',
      color: 'border-purple-500',
      delay: 0.2,
    },
    {
      label: text.messages,
      value: stats.messages,
      icon: '✉️',
      color: 'border-orange-500',
      delay: 0.3,
      subtitle:
        stats.unreadMessages > 0
          ? `${stats.unreadMessages} ${text.unreadSuffix}`
          : text.allViewed,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-12 dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">{text.adminPanel}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {text.welcome}, {user?.username || 'Admin'} 👋
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
          >
            <span>🚪</span>
            {text.logout}
          </button>
        </motion.div>

        <div className="mb-8 grid gap-6 md:grid-cols-4">
          {statsCards.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className={`rounded-xl border-l-4 ${stat.color} bg-white p-6 shadow-lg dark:bg-gray-800`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {statsLoading ? '—' : stat.value}
                  </p>
                  {!statsLoading && stat.subtitle && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
                  )}
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 rounded-xl bg-white shadow-lg dark:bg-gray-800">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'dashboard', label: text.dashboard, icon: '📊' },
              { id: 'projects', label: text.projects, icon: '📁' },
              { id: 'skills', label: text.skills, icon: '⚡' },
              { id: 'experiences', label: text.experiences, icon: '💼' },
              { id: 'messages', label: text.messages, icon: '✉️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {text.welcomeUser}, {user?.username || 'Yigit'}! 👋
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Backend bağlantısı aktif; projeler sekmesinden içerik oluşturabilir, istatistikleri anlık
                  takip edebilirsin. Beceriler ve mesajlar için gelişmiş yönetim ekranları sıradaki iterasyonda
                  devreye girecek.
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">🚀 Odaklanılacak Başlıklar</h3>
                <ul className="ml-4 space-y-2 text-blue-800 dark:text-blue-200">
                  <li>Proje listesi üzerinden CRUD akışlarını test et.</li>
                  <li>Mesaj sekmesi için backend endpoint'lerini bağla.</li>
                  <li>Yetki hataları için otomatik yönlendirmeyi doğrula.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {text.projectManagement}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kayıtlı projeleri listele, yeni projeler ekle veya mevcutları güncelle.
                  </p>
                </div>
                <button
                  onClick={openCreateProjectModal}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {text.addProject}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Başlık
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Slug
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Öne Çıkan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Sıra
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Güncellendi
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900/20">
                    {projectsLoading && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Projeler yükleniyor...
                        </td>
                      </tr>
                    )}

                    {!projectsLoading && projects.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Bu alanda henüz proje bulunmuyor. Yeni bir proje oluşturabilirsiniz.
                        </td>
                      </tr>
                    )}

                    {!projectsLoading && projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {project.title || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {project.slug || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {project.featured ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                              Evet
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              Hayır
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {project.displayOrder}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(project.updatedAt, dateLocale)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openTranslationModal(project)}
                              className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/40"
                              title="Çevirileri yönet"
                            >
                              🌐 {text.translate}
                            </button>
                            <button
                              onClick={() => openImageManager(project)}
                              className="rounded-lg border border-purple-500 px-3 py-1.5 text-xs font-semibold text-purple-600 transition hover:bg-purple-50 dark:border-purple-400 dark:text-purple-300 dark:hover:bg-purple-900/40"
                              title="Proje resimlerini yönet"
                            >
                              🖼️ {text.images}
                            </button>
                            <button
                              onClick={() => openEditProjectModal(project)}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              {text.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project)}
                              className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40"
                              disabled={projectActionId === project.id}
                            >
                              {projectActionId === project.id ? text.deleting : text.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{text.skillManagement}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kayıtlı becerileri listele, düzenle veya sil.
                  </p>
                </div>
                <button
                  onClick={openCreateSkillModal}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {text.addSkill}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        İsim
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Yeterlilik
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900/20">
                    {skillsLoading && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Beceriler yükleniyor...
                        </td>
                      </tr>
                    )}

                    {!skillsLoading && skills.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Henüz beceri bulunmuyor.
                        </td>
                      </tr>
                    )}

                    {!skillsLoading && skills.map((skill) => (
                      <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {skill.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {skill.category || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {skill.proficiency}%
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditSkillModal(skill)}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              {text.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40"
                            >
                              {text.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'experiences' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{text.experienceManagement}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Kayıtlı deneyimleri listele, düzenle veya sil.
                  </p>
                </div>
                <button
                  onClick={openCreateExperienceModal}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {text.addExperience}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Başlık
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Kuruluş
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tür
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tarih
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900/20">
                    {experiencesLoading && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Deneyimler yükleniyor...
                        </td>
                      </tr>
                    )}

                    {!experiencesLoading && experiences.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Henüz deneyim bulunmuyor.
                        </td>
                      </tr>
                    )}

                    {!experiencesLoading && experiences.map((experience) => (
                      <tr key={experience.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {experience.title || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {experience.organization || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {experience.experience_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(experience.start_date).toLocaleDateString(dateLocale)}
                          {experience.is_current
                            ? adminLanguage === 'tr'
                              ? ' - Devam ediyor'
                              : ' - Ongoing'
                            : experience.end_date
                              ? ` - ${new Date(experience.end_date).toLocaleDateString(dateLocale)}`
                              : ''}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditExperienceModal(experience)}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              {text.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteExperience(experience.id)}
                              className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40"
                            >
                              {text.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{text.incomingMessages}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  İletişim formundan gelen mesajları yönetin.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        İsim
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        E-posta
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Konu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Durum
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Tarih
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900/20">
                    {messagesLoading && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Mesajlar yükleniyor...
                        </td>
                      </tr>
                    )}

                    {!messagesLoading && messages.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Henüz mesaj bulunmuyor.
                        </td>
                      </tr>
                    )}

                    {!messagesLoading && messages.map((message) => (
                      <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {message.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {message.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {message.subject || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {!message.is_read ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                              Okunmadı
                            </span>
                          ) : message.is_replied ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                              Yanıtlandı
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                              Okundu
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(message.created_at, dateLocale)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            {!message.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(message.id)}
                                className="rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/40"
                                disabled={messageActionId === message.id}
                              >
                                {messageActionId === message.id ? 'İşleniyor...' : 'Okundu'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/40"
                              disabled={messageActionId === message.id}
                            >
                              {messageActionId === message.id ? text.deleting : text.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {projectModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 px-4 py-8">
          <div
            ref={projectModalRef}
            tabIndex={-1}
            data-admin-modal="project"
            className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {projectFormMode === 'create' ? 'Yeni Proje Oluştur' : 'Projeyi Düzenle'}
              </h3>
              <button
                onClick={() => closeProjectModal()}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <ProjectForm
              initialValues={projectFormValues}
              onSubmit={handleProjectSubmit}
              onCancel={() => closeProjectModal()}
              loading={projectFormSubmitting}
              mode={projectFormMode}
              technologies={technologies}
              loadingTechnologies={loadingTechnologies}
              language={adminLanguage}
            />
          </div>
        </div>
      )}

      {skillModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 px-4 py-8">
          <div
            ref={skillModalRef}
            tabIndex={-1}
            data-admin-modal="skill"
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {skillFormMode === 'create' ? 'Yeni Beceri Ekle' : 'Beceri Düzenle'}
              </h3>
              <button
                onClick={() => closeSkillModal()}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <SkillForm
              initialValues={skillFormValues}
              onSubmit={handleSkillFormSubmit}
              onCancel={() => closeSkillModal()}
              loading={skillFormSubmitting}
              mode={skillFormMode}
              language={adminLanguage}
            />
          </div>
        </div>
      )}

      {experienceModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 px-4 py-8">
          <div
            ref={experienceModalRef}
            tabIndex={-1}
            data-admin-modal="experience"
            className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {experienceFormMode === 'create' ? 'Yeni Deneyim Ekle' : 'Deneyim Düzenle'}
              </h3>
              <button
                onClick={() => closeExperienceModal()}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <ExperienceForm
              initialValues={experienceFormValues}
              onSubmit={handleExperienceFormSubmit}
              onCancel={() => closeExperienceModal()}
              loading={experienceFormSubmitting}
              mode={experienceFormMode}
              language={adminLanguage}
            />
          </div>
        </div>
      )}

      {imageManagerOpen && currentProjectForImages && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4">
          <div
            ref={imageManagerModalRef}
            tabIndex={-1}
            data-admin-modal="image-manager"
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Proje Resimleri
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {currentProjectForImages.title}
                </p>
              </div>
              <button
                onClick={closeImageManager}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Yüklemek için tıklayın</span> veya sürükleyin
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  disabled={uploadingImage}
                />
              </label>

              {/* Upload Progress */}
              {uploadingImage && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Yükleniyor...
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                      role="progressbar"
                      aria-label="Upload progress bar"
                      aria-valuenow={uploadProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Images Grid */}
            {imagesLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">Resimler yükleniyor...</div>
              </div>
            ) : projectImages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  Henüz resim yüklenmemiş. Yukarıdan resim ekleyebilirsiniz.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Image Preview */}
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                      <img
                        src={image.image_url}
                        alt={image.caption || `Proje resmi ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Image Actions */}
                    <div className="absolute top-5 right-5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="rounded-lg bg-red-600 p-2 text-white shadow-lg hover:bg-red-700"
                        title="Resmi sil"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Caption */}
                    <div className="mt-3">
                      <label htmlFor={`image-caption-${image.id}`} className="sr-only">
                        Resim açıklaması
                      </label>
                      <input
                        id={`image-caption-${image.id}`}
                        type="text"
                        value={image.caption || ''}
                        onChange={(e) => handleUpdateImageCaption(image.id, e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value !== image.caption) {
                            handleUpdateImageCaption(image.id, e.target.value);
                          }
                        }}
                        className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Resim açıklaması..."
                      />
                    </div>

                    {/* Display Order */}
                    <div className="mt-2 flex items-center gap-2">
                      <label htmlFor={`image-order-${image.id}`} className="text-xs text-gray-500 dark:text-gray-400">
                        Sıra:
                      </label>
                      <input
                        id={`image-order-${image.id}`}
                        type="number"
                        value={image.display_order}
                        onChange={(e) => {
                          const newOrder = parseInt(e.target.value) || 0;
                          handleUpdateImageOrder(image.id, newOrder);
                        }}
                        className="w-16 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                        aria-label="Resim sırası"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Translation Manager Modal */}
      {translationModalOpen && currentProjectForTranslations && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 p-4">
          <div
            ref={translationModalRef}
            tabIndex={-1}
            data-admin-modal="translation"
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Proje Çevirileri
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {currentProjectForTranslations.title}
                </p>
              </div>
              <button
                onClick={closeTranslationModal}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            {translationsLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">Çeviriler yükleniyor...</div>
              </div>
            ) : (
              <TranslationEditor
                translations={currentTranslations}
                onSave={handleSaveTranslation}
                loading={translationsLoading}
                language={adminLanguage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}




