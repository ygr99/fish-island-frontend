export default [
  { path: '/user', layout: false, requireAuth: false, routes: [
      { path: '/user/login', component: './User/Login', requireAuth: false },
      { path: '/user/register', component: './User/Register', requireAuth: false }
    ]},
  { path: '/index', icon: 'BarsOutlined', component: './Index', name: '最新', requireAuth: false },
  { path: '/home', layout: false, icon: 'smile', component: './Home', name: '浏览器页面', requireAuth: false },
  { path: '/todo', icon: 'CalendarOutlined', component: './TODO', name: '每日待办', requireAuth: true },
  { path: '/chat', icon: 'MessageOutlined', component: './Chat', name: '摸鱼室', requireAuth: true },
  { path: '/reader', icon: 'BookOutlined', component: './Reader', name: '摸鱼阅读', requireAuth: true },
  // { path: '/draw', icon: 'MessageOutlined', component: './Draw', name: '你画我猜', requireAuth: true },
  {
    path: '/game',
    icon: 'DesktopOutlined',
    name: '小游戏',
    requireAuth: true,
    routes: [
      { path: '/game', redirect: '/game/piece', requireAuth: true },
      { icon: 'DesktopOutlined', path: '/game/piece', component: './Game/Piece', name: '五子棋', requireAuth: true },
      { icon: 'DesktopOutlined', path: '/game/chineseChess', component: './Game/ChineseChess', name: '中国象棋', requireAuth: true },
      { icon: 'DesktopOutlined', path: '/game/travel', component: './Game/Travel', name: '摸鱼旅游', requireAuth: true },
      { icon: 'DesktopOutlined', path: '/game/2048', component: './Game/2048', name: '2048', requireAuth: false },
      { icon: 'DesktopOutlined', path: '/game/car', component: './Game/Car', name: '模拟赛车', requireAuth: false },
      { icon: 'DesktopOutlined', path: '/game/jump', component: './Game/Jump', name: '跳一跳   ', requireAuth: false },
      { icon: 'DesktopOutlined', path: '/game/infinityGames', component: './Game/InfinityGames', name: '游戏大全', requireAuth: false },
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
      { icon: 'DesktopOutlined', path: '/utils/compare', component: './Utils/Compare', name: '文本比对', requireAuth: false },
      { icon: 'TranslationOutlined', path: '/utils/translation', component: './Utils/Translation', name: '聚合翻译', requireAuth: false },
      { icon: 'GithubOutlined', path: '/utils/git-commit', component: './Utils/GitCommit', name: 'Git提交内容生成', requireAuth: false },
      { icon: 'RobotOutlined', path: '/utils/ai-agent', component: './Utils/AIAgent', name: 'AI智能体', requireAuth: false },
      { icon: 'CalendarOutlined', path: '/utils/weekly-report', component: './Utils/WeeklyReport', name: 'AI周报助手', requireAuth: false },
    ],
  },
  { icon: 'PictureOutlined', path: '/avatarFrames', component: './Utils/AvatarFrames', name: '头像框兑换', requireAuth: true },
  {
    path: '/rank',
    icon: 'github',
    name: '支持网站',
    routes: [
      { icon: 'DesktopOutlined', path: '/rank/reward', component: './Rank/Reward', name: '打赏榜 👑', requireAuth: false },
      { icon: 'DesktopOutlined', path: '/rank/about', component: './About', name: '共建与反馈 🚀', requireAuth: false },
      {path: 'https://github.com/lhccong/fish-island-backend', name: '狠狠点个 star 🌟'},

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
