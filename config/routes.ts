export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' },{ path: '/user/register', component: './User/Register' }] },
  { path: '/index', icon: 'smile', component: './Index', name: '最新' },
  { path: '/todo', icon: 'CalendarOutlined', component: './TODO', name: '每日待办' },
  { path: '/rank', icon: 'crown', component: './Rank', name: '摸鱼榜' },
  {
    path: '/game',
    icon: 'DesktopOutlined',
    name: '小游戏',
    routes: [
      { path: '/game', redirect: '/game/piece' },
      { icon: 'DesktopOutlined', path: '/game/piece', component: './Game/Piece', name: '五子棋' },
      { icon: 'DesktopOutlined', path: '/game/2048', component: './Game/2048', name: '2048' },
    ],
  },
  // { path: '/game', icon: 'DesktopOutlined', component: './Game/Piece', name: '五子棋' },
  {
    path: '/admin',
    icon: 'crown',
    name: '管理页',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: '/admin/user' },
      { icon: 'table', path: '/admin/user', component: './Admin/User', name: '用户管理' },
    ],
  },
  { path: '/', redirect: '/index' },
  { path: '*', layout: false, component: './404' },
];
