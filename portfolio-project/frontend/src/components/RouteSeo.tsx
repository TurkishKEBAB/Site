import { useLocation } from 'react-router-dom'

import { useLanguage } from '../contexts/LanguageContext'
import { getSeoConfig } from '../seo/seoConfig'
import Seo from './Seo'

export default function RouteSeo() {
  const location = useLocation()
  const { language } = useLanguage()
  const seoConfig = getSeoConfig(location.pathname, language)

  return <Seo {...seoConfig} />
}
