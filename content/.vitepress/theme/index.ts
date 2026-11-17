import DefaultTheme from 'vitepress/theme'
import {h} from 'vue'
import KnowledgeHome from './KnowledgeHome.vue'
import KnowledgeTrail from './KnowledgeTrail.vue'
import './style.css'
import './terminal.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout,null,{'doc-before':()=>h(KnowledgeTrail)}),
  enhanceApp({ app }) { app.component('KnowledgeHome', KnowledgeHome) },
}
