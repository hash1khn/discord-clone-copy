import { useMemo } from 'react';
import { paths } from 'src/routes/paths';
import SvgColor from 'src/components/svg-color';

// Define the icon function
const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

// Define the ICONS object
const ICONS = {
  server: icon('ic_server'), // Add a server icon
  chat: icon('ic_chat'), // Text channel icon
  voice: icon('ic_speak'), // Voice channel icon
  add: icon('ic_add'), // Add server icon
  user: icon('ic_user'),
};

// Define the props for useNavData
interface UseNavDataProps {
  handleAddServerClick?: () => void; // Make it optional
}

export function useNavData({ handleAddServerClick = () => {} }: UseNavDataProps = {}) {
  const data = useMemo(
    () => [
      // HOME PAGE REDIRECT
      {
        subheader: 'Home',
        items: [
          {
            title: 'Home',
            path: paths.dashboard.user.root, // Redirect to dashboard.path.one
            icon: ICONS.user,
          },
        ],
      },

      // LIST OF SERVERS
      {
        subheader: 'Servers',
        items: [
          {
            title: 'Server 1',
            path: paths.dashboard.one, // Root path for Server 1
            icon: ICONS.server,
            children: [
              {
                title: 'Text Channels',
                path: paths.dashboard.one, // Path for text channels
                icon: ICONS.chat,
                children: [
                  { title: 'General', path: `${paths.dashboard.one}/general` }, // Chat 1
                  { title: 'Random', path: `${paths.dashboard.one}/random` }, // Chat 2
                  // Add more chats here
                ],
              },
              {
                title: 'Voice Channels',
                path: paths.dashboard.one, // Path for voice channels
                icon: ICONS.voice,
              },
            ],
          },
          {
            title: 'Server 2',
            path: paths.dashboard.one, // Root path for Server 2
            icon: ICONS.server,
            children: [
              {
                title: 'Text Channels',
                path: paths.dashboard.one, // Path for text channels
                icon: ICONS.chat,
                children: [
                  { title: 'General', path: `${paths.dashboard.one}/general` }, // Chat 1
                  { title: 'Random', path: `${paths.dashboard.one}/random` }, // Chat 2
                  // Add more chats here
                ],
              },
              {
                title: 'Voice Channels',
                path: paths.dashboard.one, // Path for voice channels
                icon: ICONS.voice,
              },
            ],
          },
          // Add more servers here
        ],
      },

      // ADD SERVER BUTTON
      {
        subheader: 'Add Server',
        items: [
          {
            title: 'Add Server',
            path: '#', // Use a placeholder path or handle via onClick
            icon: ICONS.add,
            onClick: handleAddServerClick, // Trigger the dialog
          },
        ],
      },
    ],
    [handleAddServerClick] // Add handleAddServerClick as a dependency
  );

  return data;
}