import { Helmet } from '@umijs/max';
import defaultSettings from '../../../config/defaultSettings';

const GlobalTitle: React.FC = () => {
  return <Helmet title={defaultSettings.title} titleTemplate="%s" />;
};

export default GlobalTitle;
