import { ChatPage, GroupPage, NotFoundPage, ProfilePage, ReplyPage, SavedsPage, SearchPage, SettingPage, VerifyPage } from "~/pages";

export const route = [
    {
        path: '/profile/:id',
        element: ProfilePage,
    },
    // {
    //     path: '/admin',
    //     element: AdminPage,
    //     isPrivate: true
    // },
    {
        path: '/group/:id',
        element: GroupPage,
    },
    {
        path: '*',
        element: NotFoundPage,
    },
    {
        path: '/post/:id',
        element: ReplyPage,
    },
    {
        path: '/chat',
        element: ChatPage,
    },
    {
        path: '/settings',
        element: SettingPage,
    },
    {
        path: '/saveds',
        element: SavedsPage,
    },
    {
        path: '/verify-email',
        element: VerifyPage,
    },
    {
        path: '/search',
        element: SearchPage,
    }
]

