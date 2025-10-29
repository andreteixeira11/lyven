import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";

import { createUserProcedure } from "./routes/users/create";
import { getUserProcedure } from "./routes/users/get";
import { updateUserProcedure } from "./routes/users/update";
import { deleteUserProcedure } from "./routes/users/delete";
import { listUsersProcedure } from "./routes/users/list";
import { updateOnboardingProcedure } from "./routes/users/update-onboarding";

import { createPromoterProcedure } from "./routes/promoters/create";
import { getPromoterProcedure } from "./routes/promoters/get";
import { updatePromoterProcedure } from "./routes/promoters/update";
import { deletePromoterProcedure } from "./routes/promoters/delete";
import { listPromotersProcedure } from "./routes/promoters/list";
import { listPendingPromotersProcedure } from "./routes/promoters/list-pending";
import { approvePromoterProcedure } from "./routes/promoters/approve";
import { rejectPromoterProcedure } from "./routes/promoters/reject";
import { getPromoterStatsProcedure } from "./routes/promoters/stats";

import { listEventsProcedure } from "./routes/events/list";
import { getEventProcedure } from "./routes/events/get";
import { createEventProcedure } from "./routes/events/create";
import { updateEventProcedure } from "./routes/events/update";
import { deleteEventProcedure } from "./routes/events/delete";
import { approveEventProcedure } from "./routes/events/approve";
import { rejectEventProcedure } from "./routes/events/reject";
import { listPendingEventsProcedure } from "./routes/events/list-pending";
import { getPendingEventDetailsProcedure } from "./routes/events/get-pending-details";
import { setEventFeaturedProcedure } from "./routes/events/featured";
import { getEventStatisticsProcedure } from "./routes/events/statistics";

import { createTicketProcedure } from "./routes/tickets/create";
import { batchCreateTicketsProcedure } from "./routes/tickets/batch-create";
import { getTicketProcedure } from "./routes/tickets/get";
import { listTicketsProcedure } from "./routes/tickets/list";
import { validateTicketProcedure } from "./routes/tickets/validate";
import { cancelTicketProcedure } from "./routes/tickets/cancel";
import { transferTicketProcedure } from "./routes/tickets/transfer";
import { addToCalendarProcedure } from "./routes/tickets/add-to-calendar";
import { setReminderProcedure } from "./routes/tickets/set-reminder";
import { generateWalletPassProcedure } from "./routes/tickets/generate-wallet-pass";

import { createAdProcedure } from "./routes/advertisements/create";
import { getAdProcedure } from "./routes/advertisements/get";
import { updateAdProcedure } from "./routes/advertisements/update";
import { deleteAdProcedure } from "./routes/advertisements/delete";
import { listAdsProcedure } from "./routes/advertisements/list";
import { listPendingAdsProcedure } from "./routes/advertisements/list-pending";
import { approveAdProcedure } from "./routes/advertisements/approve";
import { recordImpressionProcedure } from "./routes/advertisements/record-impression";
import { recordClickProcedure } from "./routes/advertisements/record-click";
import { getAdStatsProcedure } from "./routes/advertisements/stats";

import { registerPushTokenProcedure } from "./routes/notifications/register-token";
import { sendPushNotificationProcedure } from "./routes/notifications/send";
import { listNotificationsProcedure } from "./routes/notifications/list";
import { markNotificationReadProcedure } from "./routes/notifications/mark-read";

import { getDashboardAnalyticsProcedure } from "./routes/analytics/dashboard";
import { getEventsAnalyticsProcedure } from "./routes/analytics/events";
import { getPromotersAnalyticsProcedure } from "./routes/analytics/promoters";
import { getRevenueAnalyticsProcedure } from "./routes/analytics/revenue";
import { getUsersAnalyticsProcedure } from "./routes/analytics/users";

import { followProcedure } from "./routes/social/follow";
import { unfollowProcedure } from "./routes/social/unfollow";
import { getFollowersProcedure } from "./routes/social/get-followers";
import { getFollowingProcedure } from "./routes/social/get-following";
import { isFollowingProcedure } from "./routes/social/is-following";

import { sendTestEmailProcedure } from "./routes/emails/test";
import { createEventWebhookProcedure } from "./routes/webhooks/create-event";
import { loginProcedure } from "./routes/auth/login";
import { sendVerificationCodeProcedure } from "./routes/auth/send-verification-code";
import { verifyCodeProcedure } from "./routes/auth/verify-code";
import { getSmartRecommendationsProcedure } from "./routes/recommendations/get-smart-recommendations";
import { getAIRecommendationsProcedure } from "./routes/recommendations/get-ai-recommendations";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  
  users: createTRPCRouter({
    create: createUserProcedure,
    get: getUserProcedure,
    update: updateUserProcedure,
    delete: deleteUserProcedure,
    list: listUsersProcedure,
    updateOnboarding: updateOnboardingProcedure,
  }),
  
  promoters: createTRPCRouter({
    create: createPromoterProcedure,
    get: getPromoterProcedure,
    update: updatePromoterProcedure,
    delete: deletePromoterProcedure,
    list: listPromotersProcedure,
    listPending: listPendingPromotersProcedure,
    approve: approvePromoterProcedure,
    reject: rejectPromoterProcedure,
    stats: getPromoterStatsProcedure,
  }),
  
  events: createTRPCRouter({
    list: listEventsProcedure,
    get: getEventProcedure,
    create: createEventProcedure,
    update: updateEventProcedure,
    delete: deleteEventProcedure,
    approve: approveEventProcedure,
    reject: rejectEventProcedure,
    listPending: listPendingEventsProcedure,
    getPendingDetails: getPendingEventDetailsProcedure,
    setFeatured: setEventFeaturedProcedure,
    statistics: getEventStatisticsProcedure,
  }),
  
  tickets: createTRPCRouter({
    create: createTicketProcedure,
    batchCreate: batchCreateTicketsProcedure,
    get: getTicketProcedure,
    list: listTicketsProcedure,
    validate: validateTicketProcedure,
    cancel: cancelTicketProcedure,
    transfer: transferTicketProcedure,
    addToCalendar: addToCalendarProcedure,
    setReminder: setReminderProcedure,
    generateWalletPass: generateWalletPassProcedure,
  }),
  
  advertisements: createTRPCRouter({
    create: createAdProcedure,
    get: getAdProcedure,
    update: updateAdProcedure,
    delete: deleteAdProcedure,
    list: listAdsProcedure,
    listPending: listPendingAdsProcedure,
    approve: approveAdProcedure,
    recordImpression: recordImpressionProcedure,
    recordClick: recordClickProcedure,
    stats: getAdStatsProcedure,
  }),
  
  notifications: createTRPCRouter({
    registerToken: registerPushTokenProcedure,
    send: sendPushNotificationProcedure,
    list: listNotificationsProcedure,
    markRead: markNotificationReadProcedure,
  }),
  
  analytics: createTRPCRouter({
    dashboard: getDashboardAnalyticsProcedure,
    events: getEventsAnalyticsProcedure,
    promoters: getPromotersAnalyticsProcedure,
    revenue: getRevenueAnalyticsProcedure,
    users: getUsersAnalyticsProcedure,
  }),
  
  social: createTRPCRouter({
    follow: followProcedure,
    unfollow: unfollowProcedure,
    getFollowers: getFollowersProcedure,
    getFollowing: getFollowingProcedure,
    isFollowing: isFollowingProcedure,
  }),
  
  emails: createTRPCRouter({
    sendTest: sendTestEmailProcedure,
  }),
  
  webhooks: createTRPCRouter({
    createEvent: createEventWebhookProcedure,
  }),
  
  auth: createTRPCRouter({
    login: loginProcedure,
    sendVerificationCode: sendVerificationCodeProcedure,
    verifyCode: verifyCodeProcedure,
  }),
  
  recommendations: createTRPCRouter({
    smart: getSmartRecommendationsProcedure,
    ai: getAIRecommendationsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
