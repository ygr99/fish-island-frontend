export default [
  { path: '/user', layout: false, requireAuth: false, routes: [
    { path: '/user/login', component: './User/Login', requireAuth: false },
    { path: '/user/register', component: './User/Register', requireAuth: false }
  ]},
  { path: '/index', icon: 'smile', component: './Index', name: '最新', requireAuth: false },
  { path: '/todo', icon: 'CalendarOutlined', component: './TODO', name: '每日待办', requireAuth: true },
  { path: '/chat', icon: 'MessageOutlined', component: './Chat', name: '摸鱼室', requireAuth: true },
  {
    path: '/game',
    icon: 'DesktopOutlined',
    name: '小游戏',
    requireAuth: true,
    routes: [
      { path: '/game', redirect: '/game/piece', requireAuth: true },
      { icon: 'DesktopOutlined', path: '/game/piece', component: './Game/Piece', name: '五子棋', requireAuth: true },
      { icon: 'DesktopOutlined', path: '/game/2048', component: './Game/2048', name: '2048', requireAuth: false },
    ],
  },
  {
    path: '/utils',
    icon: 'CodeSandboxOutlined',
    name: ' 工具箱',
    requireAuth: true,
    routes: [
      { path: '/utils', redirect: '/utils/json', requireAuth: false },
      { icon: 'DesktopOutlined', path: '/utils/json', component: './Utils/JsonFormat', name: 'JSON格式化', requireAuth: false },
    ],
  },
  {
    path: '/admin',
    icon: 'crown',
    name: '管理页',
    access: 'canAdmin',
    requireAuth: true,
    routes: [
      { path: '/admin', redirect: '/admin/user', requireAuth: true },
      { icon: 'table', path: '/admin/user', component: './Admin/User', name: '用户管理', requireAuth: true },
    ],
  },
  { path: '/', redirect: '/index', requireAuth: true },
  { path: '*', layout: false, component: './404', requireAuth: false },
];
