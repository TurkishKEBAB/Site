"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { FiLogOut } from 'react-icons/fi';
import api from '../services/api';
import { CornerFrame } from '../components/ui';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { skillService } from '../services/skillService';
import { experienceService } from '../services/experienceService';
import { blogService } from '../services/blogService';
import { contactService, ContactMessageResponse } from '../services/contactService';
import { technologyService, Technology } from '../services/technologyService';
import type { BlogPost, BlogTranslationCreate, Experience, Skill } from '../services/types';
import type { AdminCopy, AdminProject, AdminTabId, Stats } from '../components/admin/types';
import {
  DashboardTab,
  BlogTab,
  ExperiencesTab,
  MessagesTab,
  ProjectsTab,
  SkillsTab,
  TechnologiesTab,
} from '../components/admin/tabs';
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
import {
  BlogForm,
  BlogFormValues,
  BlogTranslationEditor,
  BlogTranslationMap,
  defaultBlogFormValues,
} from '../components/admin/BlogForms';
import {
  defaultTechnologyFormValues,
  TechnologyForm,
  TechnologyFormValues,
} from '../components/admin/TechnologyForms';
import { useAdminModalFocusTrap } from '../lib/admin/useAdminModalFocusTrap';
import { buildProjectPayload } from '../lib/admin/projectPayload';
import { dossierService } from '../services/dossierService';
import {
  DossierEditor,
  emptyDossierFormValues,
  formValuesFromDossier,
  toDossierPayload,
  DossierFormValues,
} from '../components/admin/DossierEditor';

export default function Admin() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const { showToast } = useToast();
  const adminLanguage: AdminLanguage = language === 'tr' ? 'tr' : 'en';
  const dateLocale = adminLanguage === 'tr' ? 'tr-TR' : 'en-US';
  const text: AdminCopy = {
    loading: adminLanguage === 'tr' ? 'Yukleniyor...' : 'Loading...',
    adminPanel: adminLanguage === 'tr' ? 'Admin Panel' : 'Admin Panel',
    welcome: adminLanguage === 'tr' ? 'Hos geldin' : 'Welcome',
    logout: adminLanguage === 'tr' ? 'Cikis Yap' : 'Log Out',
    dashboard: adminLanguage === 'tr' ? 'Dashboard' : 'Dashboard',
    projects: adminLanguage === 'tr' ? 'Projeler' : 'Projects',
    technologies: adminLanguage === 'tr' ? 'Teknolojiler' : 'Technologies',
    skills: adminLanguage === 'tr' ? 'Beceriler' : 'Skills',
    experiences: adminLanguage === 'tr' ? 'Deneyimler' : 'Experiences',
    messages: adminLanguage === 'tr' ? 'Mesajlar' : 'Messages',
    message: adminLanguage === 'tr' ? 'Mesaj' : 'Message',
    reply: adminLanguage === 'tr' ? 'Yanıtla' : 'Reply',
    yes: adminLanguage === 'tr' ? 'Evet' : 'Yes',
    no: adminLanguage === 'tr' ? 'Hayir' : 'No',
    unreadSuffix: adminLanguage === 'tr' ? 'okunmamis' : 'unread',
    allViewed: adminLanguage === 'tr' ? 'Tumu goruntulendi' : 'All viewed',
    welcomeUser: adminLanguage === 'tr' ? 'Hos geldin' : 'Welcome',
    projectManagement: adminLanguage === 'tr' ? 'Projeler Yonetimi' : 'Projects Management',
    technologyManagement: adminLanguage === 'tr' ? 'Teknoloji Katalogu' : 'Technology Catalog',
    skillManagement: adminLanguage === 'tr' ? 'Beceriler Yonetimi' : 'Skills Management',
    experienceManagement: adminLanguage === 'tr' ? 'Deneyimler Yonetimi' : 'Experiences Management',
    incomingMessages: adminLanguage === 'tr' ? 'Gelen Mesajlar' : 'Incoming Messages',
    addProject: adminLanguage === 'tr' ? '+ Yeni Proje Ekle' : '+ Add New Project',
    addTechnology: adminLanguage === 'tr' ? '+ Yeni Teknoloji Ekle' : '+ Add Technology',
    addSkill: adminLanguage === 'tr' ? '+ Yeni Beceri Ekle' : '+ Add New Skill',
    addExperience: adminLanguage === 'tr' ? '+ Yeni Deneyim Ekle' : '+ Add New Experience',
    edit: adminLanguage === 'tr' ? 'Duzenle' : 'Edit',
    delete: adminLanguage === 'tr' ? 'Sil' : 'Delete',
    deleting: adminLanguage === 'tr' ? 'Siliniyor...' : 'Deleting...',
    translate: adminLanguage === 'tr' ? 'Ceviriler' : 'Translations',
    images: adminLanguage === 'tr' ? 'Resimler' : 'Images',
    dossier: adminLanguage === 'tr' ? 'Dosya' : 'Dossier',
    blogManagement: adminLanguage === 'tr' ? 'Blog Yonetimi' : 'Blog Management',
    addBlogPost: adminLanguage === 'tr' ? '+ Yeni Yazi Ekle' : '+ Add Blog Post',
    blogTranslations: adminLanguage === 'tr' ? 'Ceviriler' : 'Translations',
    published: adminLanguage === 'tr' ? 'Yayinda' : 'Published',
    draft: adminLanguage === 'tr' ? 'Taslak' : 'Draft',
    technologyLoading: adminLanguage === 'tr' ? 'Teknolojiler yukleniyor...' : 'Loading technologies...',
    noTechnologies: adminLanguage === 'tr' ? 'Henuz teknoloji bulunmuyor.' : 'No technologies found.',
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
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');

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
  const [dossierEditorOpen, setDossierEditorOpen] = useState(false);
  const [currentProjectForDossier, setCurrentProjectForDossier] = useState<AdminProject | null>(null);
  const [dossierFormValues, setDossierFormValues] = useState<DossierFormValues>(emptyDossierFormValues);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [dossierSaving, setDossierSaving] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingTechnologies, setLoadingTechnologies] = useState(false);
  const [technologyModalOpen, setTechnologyModalOpen] = useState(false);
  const [technologyFormMode, setTechnologyFormMode] = useState<'create' | 'edit'>('create');
  const [technologyFormValues, setTechnologyFormValues] = useState<TechnologyFormValues>({
    ...defaultTechnologyFormValues,
  });
  const [technologyFormSubmitting, setTechnologyFormSubmitting] = useState(false);
  const [activeTechnology, setActiveTechnology] = useState<Technology | null>(null);
  const [technologyActionId, setTechnologyActionId] = useState<string | null>(null);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogPostsLoading, setBlogPostsLoading] = useState(false);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogFormMode, setBlogFormMode] = useState<'create' | 'edit'>('create');
  const [blogFormValues, setBlogFormValues] = useState<BlogFormValues>({
    ...defaultBlogFormValues,
  });
  const [blogFormSubmitting, setBlogFormSubmitting] = useState(false);
  const [activeBlogPost, setActiveBlogPost] = useState<BlogPost | null>(null);
  const [blogActionId, setBlogActionId] = useState<string | null>(null);
  const [blogTranslationModalOpen, setBlogTranslationModalOpen] = useState(false);
  const [currentBlogPostForTranslations, setCurrentBlogPostForTranslations] = useState<BlogPost | null>(null);
  const [blogTranslationsLoading, setBlogTranslationsLoading] = useState(false);
  const [blogTranslations, setBlogTranslations] = useState<BlogTranslationMap>({});

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
  const projectModalRef = useRef<HTMLDivElement>(null);
  const skillModalRef = useRef<HTMLDivElement>(null);
  const experienceModalRef = useRef<HTMLDivElement>(null);
  const imageManagerModalRef = useRef<HTMLDivElement>(null);
  const translationModalRef = useRef<HTMLDivElement>(null);
  const blogModalRef = useRef<HTMLDivElement>(null);
  const blogTranslationModalRef = useRef<HTMLDivElement>(null);
  const technologyModalRef = useRef<HTMLDivElement>(null);
  const dossierEditorModalRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

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

  const loadBlogPosts = useCallback(async () => {
    setBlogPostsLoading(true);
    try {
      const response = await blogService.getAdminPosts({
        limit: 100,
        language: adminLanguage,
      });
      setBlogPosts(Array.isArray(response.items) ? response.items : []);
    } catch (error) {
      handleApiError(
        error,
        adminLanguage === 'tr' ? 'Blog yazilari yuklenemedi.' : 'Failed to load blog posts.',
      );
    } finally {
      setBlogPostsLoading(false);
    }
  }, [adminLanguage, handleApiError]);

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
    } else if (activeTab === 'technologies') {
      loadTechnologies();
    } else if (activeTab === 'blog') {
      loadBlogPosts();
    } else if (activeTab === 'skills') {
      loadSkills();
    } else if (activeTab === 'experiences') {
      loadExperiences();
    } else if (activeTab === 'messages') {
      loadMessages();
    }
  }, [activeTab, loadProjects, loadTechnologies, loadBlogPosts, loadSkills, loadExperiences, loadMessages]);

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

      if (blogTranslationModalOpen) {
        setBlogTranslationModalOpen(false);
        setCurrentBlogPostForTranslations(null);
        setBlogTranslations({});
        return;
      }

      if (technologyModalOpen) {
        if (!technologyFormSubmitting) {
          setTechnologyModalOpen(false);
          setTechnologyFormValues({ ...defaultTechnologyFormValues });
          setActiveTechnology(null);
        }
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
        return;
      }

      if (dossierEditorOpen) {
        if (!dossierSaving) {
          setDossierEditorOpen(false);
          setCurrentProjectForDossier(null);
          setDossierFormValues(emptyDossierFormValues);
        }
        return;
      }

      if (blogModalOpen) {
        if (!blogFormSubmitting) {
          setBlogModalOpen(false);
          setBlogFormValues({ ...defaultBlogFormValues });
          setActiveBlogPost(null);
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [
    experienceFormSubmitting,
    experienceModalOpen,
    blogFormSubmitting,
    blogModalOpen,
    blogTranslationModalOpen,
    dossierEditorOpen,
    dossierSaving,
    imageManagerOpen,
    projectFormSubmitting,
    projectModalOpen,
    skillFormSubmitting,
    skillModalOpen,
    technologyFormSubmitting,
    technologyModalOpen,
    translationModalOpen,
  ]);

  const activeModalRef = (
    [
      [translationModalOpen, translationModalRef],
      [blogTranslationModalOpen, blogTranslationModalRef],
      [technologyModalOpen, technologyModalRef],
      [imageManagerOpen, imageManagerModalRef],
      [dossierEditorOpen, dossierEditorModalRef],
      [experienceModalOpen, experienceModalRef],
      [skillModalOpen, skillModalRef],
      [projectModalOpen, projectModalRef],
      [blogModalOpen, blogModalRef],
    ] as const
  ).find(([isOpen]) => isOpen)?.[1] ?? null;

  useAdminModalFocusTrap(activeModalRef);

  const normalizeOptional = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const blogPostToFormValues = (post: BlogPost): BlogFormValues => ({
    title: post.title || '',
    slug: post.slug || '',
    excerpt: post.excerpt || '',
    content: post.content || '',
    coverImage: post.cover_image || '',
    tags: (post.tags || []).join(', '),
    readingTime: post.reading_time ?? post.read_time ?? 0,
    published: post.published ?? Boolean(post.is_published),
  });

  const openCreateBlogModal = () => {
    setBlogFormMode('create');
    setBlogFormValues({ ...defaultBlogFormValues });
    setActiveBlogPost(null);
    setBlogModalOpen(true);
  };

  const openEditBlogModal = (post: BlogPost) => {
    setBlogFormMode('edit');
    setBlogFormValues(blogPostToFormValues(post));
    setActiveBlogPost(post);
    setBlogModalOpen(true);
  };

  const closeBlogModal = (force = false) => {
    if (blogFormSubmitting && !force) {
      return;
    }
    setBlogModalOpen(false);
    setBlogFormValues({ ...defaultBlogFormValues });
    setActiveBlogPost(null);
  };

  const handleBlogSubmit = async (values: BlogFormValues) => {
    setBlogFormSubmitting(true);

    const tags = values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag, index, all) => all.indexOf(tag) === index);

    const payload = {
      title: values.title.trim(),
      content: values.content,
      excerpt: normalizeOptional(values.excerpt) || undefined,
      cover_image: normalizeOptional(values.coverImage) || undefined,
      tags,
      reading_time: values.readingTime || undefined,
      published: values.published,
    };

    try {
      if (blogFormMode === 'create') {
        await blogService.createPost({
          ...payload,
          slug: normalizeOptional(values.slug) || undefined,
        });
        showToast('success', adminLanguage === 'tr' ? 'Yazi olusturuldu.' : 'Blog post created.');
      } else if (activeBlogPost) {
        await blogService.updatePost(activeBlogPost.id, payload);
        showToast('success', adminLanguage === 'tr' ? 'Yazi guncellendi.' : 'Blog post updated.');
      }

      closeBlogModal(true);
      await loadBlogPosts();
    } catch (error) {
      handleApiError(
        error,
        adminLanguage === 'tr' ? 'Yazi kaydedilemedi.' : 'Blog post could not be saved.',
      );
    } finally {
      setBlogFormSubmitting(false);
    }
  };

  const handleDeleteBlogPost = async (postId: string) => {
    const post = blogPosts.find((item) => item.id === postId);
    const confirmed = window.confirm(
      adminLanguage === 'tr'
        ? 'Bu blog yazisini silmek istediginizden emin misiniz?'
        : `Are you sure you want to delete "${post?.title || 'this post'}"?`,
    );
    if (!confirmed) {
      return;
    }

    setBlogActionId(postId);
    try {
      await blogService.deletePost(postId);
      showToast('success', adminLanguage === 'tr' ? 'Yazi silindi.' : 'Blog post deleted.');
      await loadBlogPosts();
    } catch (error) {
      handleApiError(
        error,
        adminLanguage === 'tr' ? 'Yazi silinemedi.' : 'Blog post could not be deleted.',
      );
    } finally {
      setBlogActionId(null);
    }
  };

  const loadBlogTranslations = async (post: BlogPost) => {
    setBlogTranslationsLoading(true);
    try {
      const detail = await blogService.getAdminPost(post.id);
      const translationMap: BlogTranslationMap = {};
      (detail.translations || []).forEach((translation) => {
        if (translation.language === 'en' || translation.language === 'tr') {
          translationMap[translation.language] = translation;
        }
      });
      setBlogTranslations(translationMap);
    } catch (error) {
      handleApiError(
        error,
        adminLanguage === 'tr' ? 'Ceviriler yuklenemedi.' : 'Translations could not be loaded.',
      );
    } finally {
      setBlogTranslationsLoading(false);
    }
  };

  const openBlogTranslationModal = async (post: BlogPost) => {
    setCurrentBlogPostForTranslations(post);
    setBlogTranslationModalOpen(true);
    await loadBlogTranslations(post);
  };

  const closeBlogTranslationModal = () => {
    setBlogTranslationModalOpen(false);
    setCurrentBlogPostForTranslations(null);
    setBlogTranslations({});
  };

  const handleSaveBlogTranslation = async (
    languageCode: 'en' | 'tr',
    data: BlogTranslationCreate,
  ) => {
    if (!currentBlogPostForTranslations) {
      return;
    }

    try {
      await blogService.addTranslation(currentBlogPostForTranslations.id, {
        ...data,
        language: languageCode,
      });
      showToast(
        'success',
        adminLanguage === 'tr'
          ? `${languageCode.toUpperCase()} cevirisi kaydedildi.`
          : `${languageCode.toUpperCase()} translation saved.`,
      );
      await loadBlogTranslations(currentBlogPostForTranslations);
    } catch (error) {
      handleApiError(
        error,
        adminLanguage === 'tr' ? 'Ceviri kaydedilemedi.' : 'Translation could not be saved.',
      );
    }
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
        await api.post('/projects/', buildProjectPayload(values, true));

        showToast('success', 'Proje başarıyla oluşturuldu.');
      } else if (activeProject) {
        await api.put(`/projects/${activeProject.id}`, buildProjectPayload(values, false));

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

  const closeDossierEditor = (force = false) => {
    if (dossierSaving && !force) {
      return;
    }
    setDossierEditorOpen(false);
    setCurrentProjectForDossier(null);
    setDossierFormValues(emptyDossierFormValues);
  };

  const openDossierEditor = async (project: AdminProject) => {
    setCurrentProjectForDossier(project);
    setDossierFormValues(emptyDossierFormValues);
    setDossierEditorOpen(true);
    setDossierLoading(true);

    try {
      const dossier = await dossierService.getAdminDossier(project.id);
      setDossierFormValues(formValuesFromDossier(dossier));
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      if (status !== 404) {
        handleApiError(
          error,
          adminLanguage === 'tr' ? 'Proje dosyasi yuklenemedi.' : 'Project dossier could not be loaded.',
        );
      }
    } finally {
      setDossierLoading(false);
    }
  };

  const handleDossierSubmit = async (values: DossierFormValues) => {
    if (!currentProjectForDossier) {
      return;
    }

    setDossierSaving(true);
    try {
      const dossier = await dossierService.upsertDossier(
        currentProjectForDossier.id,
        toDossierPayload(values),
      );
      setDossierFormValues(formValuesFromDossier(dossier));
      showToast(
        'success',
        adminLanguage === 'tr' ? 'Proje dosyasi kaydedildi.' : 'Project dossier saved.',
      );
      closeDossierEditor(true);
    } catch (error) {
      handleApiError(
        error,
        adminLanguage === 'tr' ? 'Proje dosyasi kaydedilemedi.' : 'Project dossier could not be saved.',
      );
    } finally {
      setDossierSaving(false);
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

  const openCreateTechnologyModal = () => {
    setTechnologyFormMode('create');
    setTechnologyFormValues({ ...defaultTechnologyFormValues });
    setActiveTechnology(null);
    setTechnologyModalOpen(true);
  };

  const openEditTechnologyModal = (technology: Technology) => {
    setTechnologyFormMode('edit');
    setTechnologyFormValues({
      name: technology.name || '',
      slug: technology.slug || '',
      icon: technology.icon || '',
      category: technology.category || '',
      color: technology.color || '',
    });
    setActiveTechnology(technology);
    setTechnologyModalOpen(true);
  };

  const closeTechnologyModal = () => {
    setTechnologyModalOpen(false);
    setTechnologyFormValues({ ...defaultTechnologyFormValues });
    setActiveTechnology(null);
  };

  const handleTechnologyFormSubmit = async (values: TechnologyFormValues) => {
    setTechnologyFormSubmitting(true);

    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        icon: values.icon.trim() || undefined,
        category: values.category.trim() || undefined,
        color: values.color.trim() || undefined,
      };

      if (technologyFormMode === 'create') {
        await technologyService.create(payload);
        showToast('success', adminLanguage === 'tr' ? 'Teknoloji olusturuldu.' : 'Technology created.');
      } else if (activeTechnology) {
        await technologyService.update(activeTechnology.id, payload);
        showToast('success', adminLanguage === 'tr' ? 'Teknoloji guncellendi.' : 'Technology updated.');
      }

      closeTechnologyModal();
      await loadTechnologies();
    } catch (error) {
      handleApiError(error, adminLanguage === 'tr' ? 'Teknoloji kaydedilemedi.' : 'Technology could not be saved.');
    } finally {
      setTechnologyFormSubmitting(false);
    }
  };

  const handleDeleteTechnology = async (technologyId: string) => {
    const confirmed = window.confirm(
      adminLanguage === 'tr'
        ? 'Bu teknolojiyi silmek istediginizden emin misiniz?'
        : 'Are you sure you want to delete this technology?',
    );
    if (!confirmed) {
      return;
    }

    setTechnologyActionId(technologyId);
    try {
      await technologyService.delete(technologyId);
      showToast('success', adminLanguage === 'tr' ? 'Teknoloji silindi.' : 'Technology deleted.');
      await loadTechnologies();
    } catch (error) {
      handleApiError(error, adminLanguage === 'tr' ? 'Teknoloji silinemedi.' : 'Technology could not be deleted.');
    } finally {
      setTechnologyActionId(null);
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
      domain: skill.domain || 'backend',
      ring: skill.ring || 'assess',
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
          domain: values.domain,
          ring: values.ring,
          icon_url: values.iconUrl.trim() || null,
        });

        showToast('success', 'Beceri başarıyla oluşturuldu.');
      } else if (activeSkill) {
        await skillService.updateSkill(activeSkill.id, {
          name: values.name.trim(),
          category: values.category.trim(),
          domain: values.domain,
          ring: values.ring,
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

  const technologyAdminTab = { id: 'technologies' as const, label: text.technologies, icon: 'TECH' };
  const adminTabs: Array<{ id: AdminTabId; label: string; icon: string }> = [
    { id: 'blog', label: 'Blog', icon: 'blog' },
    { id: 'dashboard', label: text.dashboard, icon: '📊' },
    { id: 'projects', label: text.projects, icon: '📁' },
    { id: 'skills', label: text.skills, icon: '⚡' },
    { id: 'experiences', label: text.experiences, icon: '💼' },
    { id: 'messages', label: text.messages, icon: '✉️' },
  ];
  adminTabs.splice(3, 0, technologyAdminTab);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="sys-label flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">//</span> ADMIN.CONTROL
            </span>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
              {text.adminPanel}
            </h1>
            <p className="mt-1.5 font-mono text-xs text-gray-500 dark:text-dark-400">
              {text.welcome}, {user?.username || 'Admin'} ·{' '}
              <span className="text-emerald-500 dark:text-emerald-400">[ session active ]</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded border border-gray-200 px-4 py-2 font-mono text-xs uppercase tracking-wide text-gray-600 transition-colors hover:border-red-400/50 hover:text-red-500 dark:border-dark-600 dark:text-dark-300 dark:hover:text-red-400"
          >
            <FiLogOut size={14} aria-hidden="true" />
            {text.logout}
          </button>
        </motion.div>

        <div className="mb-8 grid gap-5 md:grid-cols-4">
          {statsCards.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
            >
              <CornerFrame accent className="panel h-full p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gray-500 dark:text-dark-400">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-[2.2rem] font-bold leading-none tracking-tight">
                  <span className="text-primary-600 dark:text-primary-400">{statsLoading ? '—' : stat.value}</span>
                </p>
                {!statsLoading && stat.subtitle && (
                  <p className="mt-2 font-mono text-[11px] text-gray-400 dark:text-dark-400">{stat.subtitle}</p>
                )}
              </CornerFrame>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-1 border-b border-gray-200 dark:border-dark-600">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 font-mono text-xs uppercase tracking-wide transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-900 dark:text-dark-400 dark:hover:text-dark-50'
              }`}
            >
              {activeTab === tab.id && <span className="text-primary-400" aria-hidden="true">[ </span>}
              {tab.label}
              {activeTab === tab.id && <span className="text-primary-400" aria-hidden="true"> ]</span>}
              {activeTab === tab.id && (
                <span className="absolute inset-x-3 -bottom-px h-px bg-primary-400" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>

        <div className="panel p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardTab text={text} username={user?.username} />
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              text={text}
              projects={projects}
              projectsLoading={projectsLoading}
              projectActionId={projectActionId}
              dateLocale={dateLocale}
              onCreateProject={openCreateProjectModal}
              onEditProject={openEditProjectModal}
              onDeleteProject={handleDeleteProject}
              onOpenImageManager={openImageManager}
              onOpenDossierManager={openDossierEditor}
              onOpenTranslationManager={openTranslationModal}
            />
          )}

          {activeTab === 'technologies' && (
            <TechnologiesTab
              text={text}
              technologies={technologies}
              technologiesLoading={loadingTechnologies}
              technologyActionId={technologyActionId}
              onCreateTechnology={openCreateTechnologyModal}
              onEditTechnology={openEditTechnologyModal}
              onDeleteTechnology={handleDeleteTechnology}
            />
          )}

          {activeTab === 'blog' && (
            <BlogTab
              text={text}
              posts={blogPosts}
              postsLoading={blogPostsLoading}
              postActionId={blogActionId}
              dateLocale={dateLocale}
              onCreatePost={openCreateBlogModal}
              onEditPost={openEditBlogModal}
              onDeletePost={handleDeleteBlogPost}
              onOpenTranslationManager={openBlogTranslationModal}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsTab
              text={text}
              skills={skills}
              skillsLoading={skillsLoading}
              onCreateSkill={openCreateSkillModal}
              onEditSkill={openEditSkillModal}
              onDeleteSkill={handleDeleteSkill}
            />
          )}

          {activeTab === 'experiences' && (
            <ExperiencesTab
              text={text}
              experiences={experiences}
              experiencesLoading={experiencesLoading}
              adminLanguage={adminLanguage}
              dateLocale={dateLocale}
              onCreateExperience={openCreateExperienceModal}
              onEditExperience={openEditExperienceModal}
              onDeleteExperience={handleDeleteExperience}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesTab
              text={text}
              messages={messages}
              messagesLoading={messagesLoading}
              messageActionId={messageActionId}
              dateLocale={dateLocale}
              onMarkAsRead={handleMarkAsRead}
              onDeleteMessage={handleDeleteMessage}
            />
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

      {dossierEditorOpen && currentProjectForDossier && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 px-4 py-8">
          <div
            ref={dossierEditorModalRef}
            tabIndex={-1}
            data-admin-modal="dossier"
            className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <span className="sys-label">// CONTENT.PROJECT.DOSSIER</span>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentProjectForDossier.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => closeDossierEditor()}
                disabled={dossierSaving}
                className="rounded border border-dark-600 px-3 py-2 font-mono text-xs text-gray-500 transition hover:border-primary-400 hover:text-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close dossier editor"
              >
                ×
              </button>
            </div>
            {dossierLoading ? (
              <p className="py-12 text-center font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-dark-400">
                {adminLanguage === 'tr' ? 'Proje dosyasi yukleniyor...' : 'Loading project dossier...'}
              </p>
            ) : (
              <DossierEditor
                initialValues={dossierFormValues}
                onSubmit={handleDossierSubmit}
                onCancel={() => closeDossierEditor()}
                loading={dossierSaving}
                language={adminLanguage}
              />
            )}
          </div>
        </div>
      )}

      {technologyModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 px-4 py-8">
          <div
            ref={technologyModalRef}
            tabIndex={-1}
            data-admin-modal="technology"
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="sys-label">// CONTENT.TECHNOLOGIES</span>
              <button
                type="button"
                onClick={closeTechnologyModal}
                disabled={technologyFormSubmitting}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800"
                aria-label="Close Technology editor"
              >
                ×
              </button>
            </div>
            <TechnologyForm
              initialValues={technologyFormValues}
              onSubmit={handleTechnologyFormSubmit}
              onCancel={closeTechnologyModal}
              loading={technologyFormSubmitting}
              mode={technologyFormMode}
              language={adminLanguage}
            />
          </div>
        </div>
      )}

      {blogModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 px-4 py-8">
          <div
            ref={blogModalRef}
            tabIndex={-1}
            data-admin-modal="blog"
            className="panel max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6 md:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <span className="sys-label">// CONTENT.BLOG</span>
                <h3 className="mt-2 font-display text-2xl font-bold text-gray-900 dark:text-dark-50">
                  {blogFormMode === 'create'
                    ? adminLanguage === 'tr'
                      ? 'Yeni yazi'
                      : 'New blog post'
                    : adminLanguage === 'tr'
                      ? 'Yaziyi duzenle'
                      : 'Edit blog post'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => closeBlogModal()}
                className="rounded border border-dark-600 px-3 py-2 font-mono text-xs text-gray-500 transition hover:border-primary-400 hover:text-primary-400"
                aria-label="Close Blog editor"
              >
                ×
              </button>
            </div>
            <BlogForm
              initialValues={blogFormValues}
              onSubmit={handleBlogSubmit}
              onCancel={() => closeBlogModal()}
              loading={blogFormSubmitting}
              mode={blogFormMode}
              language={adminLanguage}
            />
          </div>
        </div>
      )}

      {blogTranslationModalOpen && currentBlogPostForTranslations && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 p-4">
          <div
            ref={blogTranslationModalRef}
            tabIndex={-1}
            data-admin-modal="blog-translation"
            className="panel max-h-[90vh] w-full max-w-4xl overflow-y-auto p-6 md:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <span className="sys-label">// CONTENT.BLOG.TRANSLATIONS</span>
                <h3 className="mt-2 font-display text-2xl font-bold text-gray-900 dark:text-dark-50">
                  {currentBlogPostForTranslations.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeBlogTranslationModal}
                className="rounded border border-dark-600 px-3 py-2 font-mono text-xs text-gray-500 transition hover:border-primary-400 hover:text-primary-400"
                aria-label="Close Blog translations"
              >
                ×
              </button>
            </div>
            {blogTranslationsLoading ? (
              <p className="py-8 text-center font-mono text-xs uppercase tracking-wide text-gray-500 dark:text-dark-400">
                {adminLanguage === 'tr' ? 'Ceviriler yukleniyor...' : 'Loading translations...'}
              </p>
            ) : (
              <BlogTranslationEditor
                translations={blogTranslations}
                onSave={handleSaveBlogTranslation}
                loading={blogTranslationsLoading}
                language={adminLanguage}
              />
            )}
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
              <label
                htmlFor="project-image-upload"
                aria-label="Proje resmi yükle"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
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
                  id="project-image-upload"
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
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={image.image_url}
                        alt={image.caption || `Proje resmi ${index + 1}`}
                        fill
                        sizes="(min-width: 1024px) 18rem, (min-width: 768px) 50vw, 100vw"
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
                          const newOrder = Number.parseInt(e.target.value, 10) || 0;
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




