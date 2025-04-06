import { SvgColor } from 'src/components/svg-color';
import { Iconify } from 'src/components/iconify';

const icon = (name: string) => (
  <SvgColor width="100%" height="100%" src={`/assets/icons/navbar/${name}.svg`} />
);

export const navData = [
  {
    title: 'Feedbacks',
    path: '/feedbacks',
    icon: icon('ic-user'),
  },
];

export const bottomNavData = {
  title: 'Logout',
  path: '/logout',
  icon: <Iconify icon="mdi:logout" sx={{ color: 'error.main' }} />,
};
