import { AppRouteRecord } from '@/types/router'

export const coreRoutes: AppRouteRecord[] = [
  {
    path: '/core/account',
    name: 'AccountRoot',
    component: '/index/index',
    meta: {
      title: 'menus.core.account',
      icon: 'ri:user-settings-line',
      single: true
    },
    children: [
      {
        path: '',
        name: 'Account',
        component: '/core/account',
        meta: {
          title: 'menus.core.account',
          icon: 'ri:user-settings-line'
        }
      }
    ]
  },
  {
    path: '/core/note-manage',
    name: 'NoteManageRoot',
    component: '/index/index',
    meta: {
      title: 'menus.core.noteManage',
      icon: 'ri:book-read-line',
      single: true
    },
    children: [
      {
        path: '',
        name: 'NoteManage',
        component: '/core/note-manage',
        meta: {
          title: 'menus.core.noteManage',
          icon: 'ri:book-read-line'
        }
      }
    ]
  },
  {
    path: '/core/comment-manage',
    name: 'CommentManageRoot',
    component: '/index/index',
    meta: {
      title: 'menus.core.commentManage',
      icon: 'ri:message-2-line',
      single: true
    },
    children: [
      {
        path: '',
        name: 'CommentManage',
        component: '/core/comment-manage',
        meta: {
          title: 'menus.core.commentManage',
          icon: 'ri:message-2-line'
        }
      }
    ]
  },

  {
    path: '/core/note-detail',
    name: 'NoteDetailRoot',
    component: '/index/index',
    meta: {
      title: 'menus.core.noteDetail',
      icon: 'ri:file-list-line',
      single: true
    },
    children: [
      {
        path: '',
        name: 'NoteDetail',
        component: '/core/note-detail',
        meta: {
          title: 'menus.core.noteDetail',
          icon: 'ri:file-list-line'
        }
      }
    ]
  },
  {
    path: '/core/agent-start',
    name: 'AgentStartRoot',
    component: '/index/index',
    meta: {
      title: 'menus.core.agentStart',
      icon: 'ri:robot-line',
      single: true
    },
    children: [
      {
        path: '',
        name: 'AgentStart',
        component: '/core/agent-start',
        meta: {
          title: 'menus.core.agentStart',
          icon: 'ri:robot-line'
        }
      }
    ]
  },
  {
    path: '/core/crawler-task',
    name: 'CrawlerTaskRoot',
    component: '/index/index',
    meta: {
      title: 'menus.core.crawlerTask',
      icon: 'ri:bug-line',
      single: true
    },
    children: [
      {
        path: '',
        name: 'CrawlerTask',
        component: '/core/crawler-task',
        meta: {
          title: 'menus.core.crawlerTask',
          icon: 'ri:bug-line'
        }
      }
    ]
  },
  {
    path: '/core/task-list',
    name: 'TaskListRoot',
    component: '/index/index',
    meta: {
      title: 'menus.core.taskList',
      icon: 'ri:list-check',
      single: true
    },
    children: [
      {
        path: '',
        name: 'TaskList',
        component: '/core/task-list',
        meta: {
          title: 'menus.core.taskList',
          icon: 'ri:list-check'
        }
      }
    ]
  },
  {
    path: '/core/system-config',
    name: 'SystemConfigRoot',
    component: '/index/index',
    meta: {
      title: 'menus.core.systemConfig',
      icon: 'ri:settings-3-line',
      single: true
    },
    children: [
      {
        path: '',
        name: 'SystemConfig',
        component: '/core/system-config',
        meta: {
          title: 'menus.core.systemConfig',
          icon: 'ri:settings-3-line'
        }
      }
    ]
  }
]
