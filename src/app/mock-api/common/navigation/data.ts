/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'pages',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
            {
                moduleKey: 'TrainingCourses,CirriculumManager',
                id      : 'lms',
                title   : 'LMS Admin',
                type    : 'collapsable',
                icon    : 'User-cus',
                children: [
                    {
                        moduleKey: 'TrainingCourses',
                        id      : 'training-course-manager',
                        title   : 'Training Courses',
                        type    : 'basic',
                        link    : '/training-course-manager',
                        icon    : 'User-cus',
                    },
                    {
                        moduleKey: 'TrainingCourses',
                        id      : 'training-courses',
                        title   : 'Training Courses New',
                        type    : 'basic',
                        link    : '/training-courses',
                        icon    : 'sms-cus',
                    },
                    
                    {
                        moduleKey: 'CirriculumManager',
                        id      : 'curriculum-manager',
                        title   : 'Curriculum Manager',
                        type    : 'basic',
                        link    : '/curriculum-manager',
                        icon    : 'key-cus',
                    },
                    {
                        moduleKey: 'CirriculumManager',
                        id      : 'curriculum-manager',
                        title   : 'Curriculum Manager New',
                        type    : 'basic',
                        link    : '/curriculum',
                        icon    : 'list-cus',
                    }
                    
                ]
            },
            {
                moduleKey: 'home',
                id   : 'home',
                title: 'Home',
                type : 'basic',
                icon : 'Image-cus',
                link : '/incentive-admin-home'
            },
            {
                moduleKey: 'mweb',
                id   : 'manage-web',
                title: 'Manage Website Content',
                type : 'basic',
                icon : 'Image-cus',
                link : '/manage-website-content'
            },
            {
                moduleKey: 'public,admin',
                id      : 'user-manage',
                title   : 'User Administration',
                type    : 'collapsable',
                icon    : 'User-cus',
                children: [
                    {
                        moduleKey: 'public',
                        id      : 'public-user',
                        title   : 'Public User',
                        type    : 'basic',
                        link    : '/public-user',
                        icon    : 'User-cus',
                    },
                    {
                        moduleKey: 'admin',
                        id      : 'admin-user',
                        title   : 'Admin User',
                        type    : 'basic',
                        link    : '/admin-user',
                        icon    : 'key-cus',
                    }
                ]
            },
            {
                moduleKey: 'pcm',
                id   : 'points-credit-manager',
                title: 'Points Credit Manager',
                type : 'basic',
                icon : 'Star-cus',
                link: '/points-credit-manager'
            },
           
            {
                moduleKey: 'rproc',
                id   : 'reward-import-process',
                title: 'Points Credit File Upload',
                type : 'basic',
                icon : 'Moveup2-cus',
                link : '/points-credit-file-upload'
            },
            {
                moduleKey: 'skum',
                id   : 'sku-list',
                title: 'SKU List Manager',
                type : 'basic',
                icon : 'list-cus',
                link : '/sku-list'
            },
            {
                moduleKey: 'ordm',
                id   : 'order-redemption-manager',
                title: 'Order Redemption Manager',
                type : 'basic',
                icon : 'cart-cus',
                link: '/order-redemption-manager'
            },
            {
                moduleKey: 'sendm',
                id   : 'send-messages',
                title: 'Send Messages',
                type : 'basic',
                icon : 'sms-cus',
                link : '/send-messages'
            },
            {
                moduleKey: 'rque,pcrs,urrm,uexpr,pushr,logr',
                id      : 'reports',
                title   : 'Reports',
                type    : 'collapsable',
                icon    : 'download-btn-cus',
                children: [
                    {
                        moduleKey: 'rque',
                        id   : 'export-queue',
                        title: 'Report Queue',
                        type : 'basic',
                        icon : 'export-queue-cus',
                        link : '/report-queue'
                    },
                    {
                        moduleKey: 'pcrs',
                        id      : 'users-rewards-credit-report',
                        title   : 'Points Credit Report (Sales)',
                        type    : 'basic',
                        link    : '/users-rewards-credit-report',
                        icon    : 'Star-cus',
                    },
                    {
                        moduleKey: 'orrm',
                        id      : 'users-rewards-redemption',
                        title   : 'Order Redemption Report',
                        type    : 'basic',
                        link    : '/users-rewards-redemption',
                        icon    : 'cart-cus',
                    },
                    {
                        moduleKey: 'uexpr',
                        id      : 'user-report',
                        title   : 'User Export Report',
                        type    : 'basic',
                        link    : '/user-report',
                        icon    : 'users-three-sidebar',
                    },
                    {
                        moduleKey: 'pushr',
                        id      : 'push-report',
                        title   : 'Push Report',
                        type    : 'basic',
                        link    : '/push-report',
                        icon    : 'chart-line-up-sidebar',
                    },
                    {
                        moduleKey: 'logr',
                        id      : 'login-report',
                        title   : 'Login Report',
                        type    : 'basic',
                        link    : '/login-report',
                        icon    : 'user-switch-sidebar',
                    }
                ]
            },
            {
                moduleKey: 'proc',
                id   : 'program-configuration',
                title: 'Program Configuration',
                type : 'basic',
                icon : 'Settings-cus',
                link: '/program-configuration'
               
            },
            {
                id   : 'logout',
                title: 'Logout',
                type : 'basic',
                icon : 'Logout-cus',
                link : '/sign-out'
            }
        ]
    }
];



export const compactNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        tooltip : 'Dashboards',
        type    : 'aside',
        icon    : 'heroicons_outline:home',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'apps',
        title   : 'Apps',
        tooltip : 'Apps',
        type    : 'aside',
        icon    : 'heroicons_outline:qrcode',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'pages',
        title   : 'Pages',
        tooltip : 'Pages',
        type    : 'aside',
        icon    : 'heroicons_outline:document-duplicate',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'user-interface',
        title   : 'UI',
        tooltip : 'UI',
        type    : 'aside',
        icon    : 'heroicons_outline:collection',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'navigation-features',
        title   : 'Navigation',
        tooltip : 'Navigation',
        type    : 'aside',
        icon    : 'heroicons_outline:menu',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'DASHBOARDS',
        type    : 'group',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'apps',
        title   : 'APPS',
        type    : 'group',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id   : 'others',
        title: 'OTHERS',
        type : 'group'
    },
    {
        id      : 'pages',
        title   : 'Pages',
        type    : 'aside',
        icon    : 'heroicons_outline:document-duplicate',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'user-interface',
        title   : 'User Interface',
        type    : 'aside',
        icon    : 'heroicons_outline:collection',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'navigation-features',
        title   : 'Navigation Features',
        type    : 'aside',
        icon    : 'heroicons_outline:menu',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : 'Dashboards',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'apps',
        title   : 'Apps',
        type    : 'group',
        icon    : 'heroicons_outline:qrcode',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'pages',
        title   : 'Pages',
        type    : 'group',
        icon    : 'heroicons_outline:document-duplicate',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'user-interface',
        title   : 'UI',
        type    : 'group',
        icon    : 'heroicons_outline:collection',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    },
    {
        id      : 'navigation-features',
        title   : 'Misc',
        type    : 'group',
        icon    : 'heroicons_outline:menu',
        children: [] // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
    }
];
