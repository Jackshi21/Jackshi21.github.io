import DefaultTheme from 'vitepress/theme'
import KnowledgeHome from './KnowledgeHome.vue'
import './style.css'
import './terminal.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) { app.component('KnowledgeHome', KnowledgeHome) },
}
