import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    {path: '', pathMatch : 'full', redirectTo: '/dashboards'},

    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: '/dashboards'},

    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)},
            {path: 'notfound', loadChildren: () => import('app/modules/pages/error/error-404/error-404.module').then(m => m.Error404Module)},
            {path: 'terms-of-use', loadChildren: () => import('app/modules/pages/termsofuse/termsofuse.module').then(m => m.TermsofuseModule)},
            {path: 'privacypolicy', loadChildren: () => import('app/modules/pages/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule)},
            {path: 'contactus', loadChildren: () => import('app/modules/pages/contact-us/contact-us.module').then(m => m.ContactUsModule)},
            {path: 'shared-published-page', loadChildren: () => import('app/modules/pages/authentication/demo-homepage/demo-homepage.module').then(m => m.DemoHomepageModule)},
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'manage-website-content', loadChildren: () => import('app/modules/pages/authentication/manage-website/manage-website.module').then(m => m.ManageWebsiteModule), data: { userType: 'admin' , title: 'Manage Website Content'}},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
        ]
    },

    {
        path       : '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
        },
        children   : [

            // Dashboards
            {path: 'dashboards', loadChildren: () => import('app/modules/pages/home/home.module').then(m => m.HomeModule)}, // this page would be access by both admin and user

            {path: 'privacy-policy', loadChildren: () => import('app/modules/pages/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule),data: { userType: ['normaluser', 'admin'] }},

            {path: 'program-rules', loadChildren: () => import('app/modules/pages/program-rules/program-rules.module').then(m => m.ProgramRulesModule),data: { userType: ['normaluser', 'admin']}},
            
            {path: 'contact-us', loadChildren: () => import('app/modules/pages/contact-us/contact-us.module').then(m => m.ContactUsModule),data: { userType: ['normaluser', 'admin'] }},
            {path: 'feedback', loadChildren: () => import('app/modules/pages/feedback/feedback.module').then(m => m.FeedbackModule),data: { userType: ['normaluser', 'admin']}},

            {path: 'termsofuse', loadChildren: () => import('app/modules/pages/termsofuse/termsofuse.module').then(m => m.TermsofuseModule),data: { userType: ['normaluser', 'admin'] }},

            {path: 'faq', loadChildren: () => import('app/modules/pages/faq/faq.module').then(m => m.FaqModule),data: { userType: ['normaluser', 'admin'] }},

            {path: 'redeem', loadChildren: () => import('app/modules/pages/redeem/redeem.module').then(m => m.RedeemModule),data: { userType: 'onebeuser' }},
           {path: 'kohler-direct-gift-cards', loadChildren: () => import('app/modules/pages/redeem-neo/redeem-neo.module').then(m => m.RedeemNeoModule),data: { userType: 'neocurruser' }},

            {path: 'reedem-neocurrency-learn-more', loadChildren: () => import('app/modules/pages/reedem-neocurrency-learn-more/reedem-neocurrency-learn-more.module').then(m => m.ReedemNeocurrencyLearnMoreModule),data: { userType: 'normaluser' }},
            {path: 'redeem-neocurrency-faq', loadChildren: () => import('app/modules/pages/redeem-faq/redeem-faq.module').then(m => m.RedeemNeoModule),data: { userType: 'normaluser' }},
            {path: 'redeem-direct-gift-card-learn-more', loadChildren: () => import('app/modules/pages/redeem-direct-gift-card-learn-more/redeem-direct-gift-card-learn-more.module').then(m => m.RedeemDirectGiftCardLearnMoreModule),data: { userType: 'normaluser' }},
            {path: 'redeem-direct-gift-card-faq', loadChildren: () => import('app/modules/pages/redeem-direct-gift-card-faq/redeem-direct-gift-card-faq.module').then(m => m.RedeemDirectGiftCardFAQModule),data: { userType: 'normaluser' }},
            {path: 'points-earned-transactions-history', loadChildren: () => import('app/modules/pages/points-earned-transactions-history/points-earned-transactions-history.module').then(m => m.PointsEarnedTransactionsHistoryModule),data: { userType: 'normaluser' }}, 

            {path: 'notifications', loadChildren: () => import('app/modules/pages/account-notification/account-notification.module').then(m => m.AccountNotificationModule),data: { userType: ['normaluser', 'admin']}},

            {path: 'transactions', loadChildren: () => import('app/modules/pages/account-transactions/account-transactions.module').then(m => m.AccountTransactionsModule),data: { userType: ['normaluser', 'admin']}},

            {path: 'performance', loadChildren: () => import('app/modules/pages/my-performance/my-performance.module').then(m => m.MyPerformanceModule),data: { userType: ['normaluser'] }},
            
            {path: 'account', loadChildren: () => import('app/modules/pages/my-account/my-account.module').then(m => m.MyAccountModule),data: { userType: ['normaluser'] }},
            
            {path: 'lms-home', loadChildren: () => import('app/modules/LMS/lms-home/lms-home.module').then(m => m.LmsHomeModule),data: { userType: 'normaluser' }},

            {path: 'bathroom_faucets', loadChildren: () => import('app/modules/LMS/bathroom-faucets/bathroom-faucets.module').then(m => m.BathroomFaucetsModule),data: { userType: 'normaluser' }},
            
            {path: 'monthly-training', loadChildren: () => import('app/modules/LMS/monthly-training/monthly-training.module').then(m => m.MonthlyTrainingModule),data: { userType: 'normaluser' }},

            {path: 'others/:id', loadChildren: () => import('app/modules/LMS/others/others.module').then(m => m.OthersModule),data: { userType: 'normaluser' }},

            // {path: 'toilets', loadChildren: () => import('app/modules/LMS/toilets/toilets.module').then(m => m.ToiletsModule)},

            // {path: 'styling-space', loadChildren: () => import('app/modules/LMS/styling-space/styling-space.module').then(m => m.StylingSpaceModule)},

            {path: 'academy-curriculums', loadChildren: () => import('app/modules/LMS/academy-cirriculums/academy-cirriculums.module').then(m => m.AcademyCirriculumsModule),data: { userType: ['normaluser', 'admin']}},

            {path: 'kohler-studio/:SubCourseId', loadChildren: () => import('app/modules/LMS/kohler-studio/kohler-studio.module').then(m => m.KohlerStudioModule),data: { userType: ['normaluser', 'admin'] }},

            {path: 'kohler-studio-course/:slideId/:courseId/:lang', loadChildren: () => import('app/modules/LMS/kohler-studio-course/kohler-studio-course.module').then(m => m.KohlerStudioCourseModule),data: { userType: ['normaluser', 'admin'] }},
            
            {path: 'kohler-studio-course/:slideId', loadChildren: () => import('app/modules/LMS/preview-course/preview-course.module').then(m => m.PreviewCourseModule),data: { userType: ['normaluser', 'admin'] }},

            {path: 'course-content-dialog/:courseId', loadChildren: () => import('app/modules/admin-panel/course-content-dialog/course-content-dialog.module').then(m => m.CourseContentDialogModule),data: { userType: ['normaluser', 'admin'] }},

            {path: 'kohler-studio-part-course/:SubCourseId/:slideId', loadChildren: () => import('app/modules/LMS/kohler-studio-part-course/kohler-studio-part-course.module').then(m => m.KohlerStudioPartCourseModule),data: { userType: ['normaluser', 'admin'] }},
            {path: 'kohler-studio-Image-course/:SubCourseId/:slideId', loadChildren: () => import('app/modules/LMS/kohler-studio-image/kohler-studio-image.module').then(m => m.KohlerStudioImageModule),data: { userType: ['normaluser', 'admin'] }},
            {path: 'kohler-studio-text-course/:SubCourseId/:slideId', loadChildren: () => import('app/modules/LMS/kohler-studio-text/kohler-studio-text.module').then(m => m.KohlerStudioTextModule),data: { userType: ['normaluser', 'admin'] }},

            {path: 'kohler-studio-course-quiz/:courseContentQuizSlideId', loadChildren: () => import('app/modules/LMS/kohler-studio-course-quiz/kohler-studio-course-quiz.module').then(m => m.KohlerStudioCourseQuizModule),data: { userType: ['normaluser', 'admin'] }},

            {path: 'kohler-studio-course-result/:courseContentQuizSlideId', loadChildren: () => import('app/modules/LMS/kohler-studio-course-result/kohler-studio-course-result.module').then(m => m.KohlerStudioCourseResultModule),data: { userType: ['normaluser', 'admin'] }},

            // Admin Panel
            
             //New LMS
            {path: 'training-courses', loadChildren: () => import('app/modules/admin-panel/training-courses/training-course.module').then(m => m.TrainingCourseModule),data: { userType: 'admin' ,title: 'Training Course New Feature',gotoRoute: '/training-courses', showGoToBtn: false, module:'incentiveadmin'}},

            {path: 'training-courses/training-courses-edit-add', loadChildren: () => import('app/modules/admin-panel/training-courses/training-courses-edit-add/training-courses-edit-add.module').then(m => m.TrainingCoursesEditAddModule),data: { userType: 'admin' , title: 'Add/Edit Training Courses'}},
            
            {
                path: 'training-courses/training-courses-edit-add/:id/:lang/:ids/:buttonAction', 
                loadChildren: () => import('app/modules/admin-panel/training-courses/training-courses-edit-add/training-courses-edit-add.module').then(m => m.TrainingCoursesEditAddModule),
                data: { userType: 'admin', title: 'Add/Edit Training Courses'}
            },
            {
                path: 'training-courses/training-courses-edit-add/:id/:lang/:ids/:buttonAction/:isEdit', 
                loadChildren: () => import('app/modules/admin-panel/training-courses/training-courses-edit-add/training-courses-edit-add.module').then(m => m.TrainingCoursesEditAddModule),
                data: { userType: 'admin', title: 'Add/Edit Training Courses'}
            },
            {
                path: 'training-courses/training-courses-editor/:id/:lang/:ids/:buttonAction/:isEdit',
                loadChildren: () => import('app/modules/admin-panel/training-courses/training-courses-editor/training-courses-editor.module').then(m => m.TrainingCoursesEditorModule),
                data: { userType: 'admin', title: 'Add/Edit Slides'}
            },
            {
                path: 'lms-editor/:slideId/:slideType/:id/:lang/:ids/:buttonAction', 
                loadChildren: () => import('app/modules/admin-panel/training-courses/lms-editor/lms-editor.module').then(m => m.LmsEditorModule),
                data: { userType: 'admin', title: 'Add/Edit Slides'}
            },
            {
                path: 'lms-editor/:slideId/:slideType/:id/:lang/:ids/:buttonAction/:isEdit', 
                loadChildren: () => import('app/modules/admin-panel/training-courses/lms-editor/lms-editor.module').then(m => m.LmsEditorModule),
                data: { userType: 'admin', title: 'Add/Edit Slides'}
            },            

            {path: 'training-course-manager', loadChildren: () => import('app/modules/admin-panel/training-course-manager/training-course-manager.module').then(m => m.TrainingCourseManagerModule),data: { userType: 'admin' ,title: 'Training Courses', gotoRoute: '/training-course-manager', showGoToBtn: false , module:'incentiveadmin'}},

            {path: 'training-course-manager/training-course-manager-add-edit', loadChildren: () => import('app/modules/admin-panel/training-course-manager/training-course-manager-add-edit/training-course-manager-add-edit.module').then(m => m.TrainingCourseManagerAddEditModule),data: { userType: 'admin' , title: 'Add/Edit Training Courses'}},
            
            {path: 'training-course-manager/training-course-manager-add-edit/:id', loadChildren: () => import('app/modules/admin-panel/training-course-manager/training-course-manager-add-edit/training-course-manager-add-edit.module').then(m => m.TrainingCourseManagerAddEditModule),data: { userType: 'admin' , title: 'Add/Edit Training Courses'}}, 
            
            {path: 'curriculum-manager', loadChildren: () => import('app/modules/admin-panel/curriculum-manager/curriculum-manager.module').then(m => m.CurriculumManagerModule),data: { userType: 'admin',title: 'Curriculum Manager', gotoRoute: '/curriculum-manager', showGoToBtn: false , module:'incentiveadmin'} }, 

            {path: 'curriculum', loadChildren: () => import('app/modules/admin-panel/curriculum/curriculum.module').then(m => m.CurriculumModule),data: { userType: 'admin',title: 'Curriculum Manager', gotoRoute: '/curriculum-manager', showGoToBtn: false , module:'incentiveadmin'} }, 

            
            {path: 'curriculum/curriculum-edit-add', loadChildren: () => import('app/modules/admin-panel/curriculum/curriculum-edit-add/curriculum-edit-add.module').then(m => m.CurriculumEditAddModule),data: { userType: 'admin' ,title: 'Add/Edit Curriculum'}}, 

            {path: 'curriculum/curriculum-edit-add/:id/:lang/:ids/:buttonAction', loadChildren: () => import('app/modules/admin-panel/curriculum/curriculum-edit-add/curriculum-edit-add.module').then(m => m.CurriculumEditAddModule),data: { userType: 'admin', title: 'Add/Edit Curriculum' }}, 
            

            {path: 'curriculum-manager/curriculum-manager-add-edit', loadChildren: () => import('app/modules/admin-panel/curriculum-manager/curriculum-manager-add-edit/curriculum-manager-add-edit.module').then(m => m.CurriculumManagerAddEditModule),data: { userType: 'admin' ,title: 'Add/Edit Curriculum'}}, 

            {path: 'curriculum-manager/curriculum-manager-add-edit/:id/:lang/:ids', loadChildren: () => import('app/modules/admin-panel/curriculum-manager/curriculum-manager-add-edit/curriculum-manager-add-edit.module').then(m => m.CurriculumManagerAddEditModule),data: { userType: 'admin', title: 'Add/Edit Curriculum' }}, 
            

            {path: 'incentive-admin-home', loadChildren: () => import('app/modules/incentive-admin-panel/incentive-admin-home/incentive-admin-home.module').then(m => m.IncentiveAdminHomeModule),data: { userType: 'admin', title: 'Home',module:'incentiveadmin' }},

            {path: 'public-user', loadChildren: () => import('app/modules/incentive-admin-panel/user-administration/user-administration.module').then(m => m.UserAdministrationModule),data: { userType: 'admin', title: 'Public User Manager', gotoRoute: '/admin-user',  showGoToBtn: false , module:'incentiveadmin' }},
            {path: 'admin-user', loadChildren: () => import('app/modules/incentive-admin-panel/user-administration/user-administration.module').then(m => m.UserAdministrationModule),data: { userType: 'admin', title: 'Admin User Manager', gotoRoute: '/public-user',  showGoToBtn: false , module:'incentiveadmin'}},

            {path: 'points-credit-manager', loadChildren: () => import('app/modules/incentive-admin-panel/points-credit-manager/points-credit-manager.module').then(m => m.PointsCreditManagerModule),data: { userType: 'admin', title: 'Points Credit Manager', gotoRoute: '/points-credit-manager', showGoToBtn: false , module:'incentiveadmin'}},
            {path: 'program-configuration', loadChildren: () => import('app/modules/incentive-admin-panel/program-configuration/program-configuration.module').then(m => m.ProgramConfigurationModule),data: { userType: 'admin', title: 'Program Configuration', gotoRoute: '/program-configuration', showGoToBtn: false , module:'incentiveadmin'}},
            {path: 'order-redemption-manager', loadChildren: () => import('app/modules/incentive-admin-panel/order-redemption/order-redemption.module').then(m => m.OrderRedemptionModule),data: { userType: 'admin', title: 'Order Redemption Manager', gotoRoute: '/order-redemption-manager', showGoToBtn: false, module:'incentiveadmin' }},
            {path: 'points-credit-file-upload', loadChildren: () => import('app/modules/incentive-admin-panel/points-credit-file-upload/points-credit-file-upload.module').then(m => m.PointsCreditFileUploadModule),data: { userType: 'admin', title: 'Points Credit File Upload', gotoRoute: '/points-credit-file-upload', showGoToBtn: false , module:'incentiveadmin'}},

            {path: 'send-messages', loadChildren: () => import('app/modules/incentive-admin-panel/send-messages/send-messages.module').then(m => m.SendMessagesModule),data: { userType: 'admin', title: 'Send Messages', gotoRoute: '/send-messages', showGoToBtn: false , module:'incentiveadmin'}},

            {path: 'report-queue', loadChildren: () => import('app/modules/incentive-admin-panel/export-queue/export-queue.module').then(m => m.ExportQueueModule), data: { userType: 'admin', title: 'Report Queue', gotoRoute: '/export-queue', showGoToBtn: false, module:'incentiveadmin' }},
            
            {path: 'users-rewards-credit-report', loadChildren: () => import('app/modules/incentive-admin-panel/users-rewards-credit-report/users-rewards-credit-report.module').then(m => m.UsersRewardsCreditReportModule),data: { userType: 'admin' ,title:'Points Credit Report (Sales)',showGoToBtn: false , module:'incentiveadmin'}},
            {path: 'users-rewards-redemption', loadChildren: () => import('app/modules/incentive-admin-panel/users-rewards-redemption/users-rewards-redemption.module').then(m => m.UsersRewardsRedemptionModule),data: { title: 'Order Redemption Report', userType: 'admin' , module:'incentiveadmin'}},

            {path: 'push-report', loadChildren: () => import('app/modules/incentive-admin-panel/user-export-push-report/user-export-push-report.module').then(m => m.UserExportPushReportModule),data: { title: 'Push Report', userType: 'admin', module:'incentiveadmin' }},
            {path: 'user-report', loadChildren: () => import('app/modules/incentive-admin-panel/user-export/user-export.module').then(m => m.UserExportModule),data: { title: 'User Export Report', userType: 'admin', module:'incentiveadmin' }},

            {path: 'sku-list', loadChildren: () => import('app/modules/incentive-admin-panel/sku-import/sku-import.module').then(m => m.SkuImportModule),data: { userType: 'admin' ,title:'SKU List Manager', module:'incentiveadmin'}},

            {path: 'login-report', loadChildren: () => import('app/modules/incentive-admin-panel/login-report/login-report.module').then(m => m.LoginReportModule),data: { userType: 'admin',title:'Login Report', module:'incentiveadmin' }},

            {path: 'email-template', loadChildren: () => import('app/modules/incentive-admin-panel/email-template/email-template.module').then(m => m.EmailTemplateModule),data: { userType: 'admin',title:'Email Template', module:'incentiveadmin' }},
            
            {path: 'email-template/email-template-add-edit', loadChildren: () => import('app/modules/incentive-admin-panel/email-template/email-template-add-edit/email-template-add-edit.module').then(m => m.EmailTemplateAddEditModule),data: { userType: 'admin',title:'Email Template Add/Edit', module:'incentiveadmin' }},
            
            {path: 'email-template/email-template-add-edit/:id', loadChildren: () => import('app/modules/incentive-admin-panel/email-template/email-template-add-edit/email-template-add-edit.module').then(m => m.EmailTemplateAddEditModule),data: { userType: 'admin',title:'Email Template Add/Edit', module:'incentiveadmin' }},
            
            {path: 'preview-email-template/:id', loadChildren: () => import('app/modules/incentive-admin-panel/email-template/preview-email-template/preview-email-template.module').then(m => m.PreviewEmailTemplateModule),data: { userType: 'admin',title:'Preview Email Template', module:'incentiveadmin' }},

            {path: 'pages', children: [

                // Activities
                {path: 'activities', loadChildren: () => import('app/modules/pages/activities/activities.module').then(m => m.ActivitiesModule)},

                // Authentication
                {path: 'authentication', loadChildren: () => import('app/modules/pages/authentication/authentication.module').then(m => m.AuthenticationModule)},

                // Coming Soon
                {path: 'coming-soon', loadChildren: () => import('app/modules/pages/coming-soon/coming-soon.module').then(m => m.ComingSoonModule)},

                // Error
                {path: 'error', children: [
                    {path: '404', loadChildren: () => import('app/modules/pages/error/error-404/error-404.module').then(m => m.Error404Module)},
                    {path: '500', loadChildren: () => import('app/modules/pages/error/error-500/error-500.module').then(m => m.Error500Module)}
                ]},

                // Invoice
                {path: 'invoice', children: [
                    {path: 'printable', children: [
                        {path: 'compact', loadChildren: () => import('app/modules/pages/invoice/printable/compact/compact.module').then(m => m.CompactModule)},
                        {path: 'modern', loadChildren: () => import('app/modules/pages/invoice/printable/modern/modern.module').then(m => m.ModernModule)}
                    ]}
                ]},

                // Maintenance
                {path: 'maintenance', loadChildren: () => import('app/modules/pages/maintenance/maintenance.module').then(m => m.MaintenanceModule)},

                // Pricing
                {path: 'pricing', children: [
                    {path: 'modern', loadChildren: () => import('app/modules/pages/pricing/modern/modern.module').then(m => m.PricingModernModule)},
                    {path: 'simple', loadChildren: () => import('app/modules/pages/pricing/simple/simple.module').then(m => m.PricingSimpleModule)},
                    {path: 'single', loadChildren: () => import('app/modules/pages/pricing/single/single.module').then(m => m.PricingSingleModule)},
                    {path: 'table', loadChildren: () => import('app/modules/pages/pricing/table/table.module').then(m => m.PricingTableModule)}
                ]},

                // Profile
                {path: 'property-accounting', loadChildren: () => import('app/modules/pages/property-accounting/property-accounting.module').then(m => m.PropertyAccountingModule)},
            ]},
          
        ]
    }
];
