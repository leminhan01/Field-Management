import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
};

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  ReportSubmit: { taskId: string; assignmentId: string };
  SurveyList: undefined;
  SurveyDetail: { surveyId: string };
  SurveyConfirmation: undefined;
};

export type CheckInStackParamList = {
  CheckIn: { outletId?: string; assignmentId?: string };
  CheckInHistory: undefined;
  NearbyOutlets: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
};

export type TabParamList = {
  TasksTab: undefined;
  MapTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

type NavigatorScreenParams<T> = { screen: keyof T; params?: T[keyof T] };

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type TaskDetailScreenProps = NativeStackScreenProps<TaskStackParamList, 'TaskDetail'>;
export type ReportSubmitScreenProps = NativeStackScreenProps<TaskStackParamList, 'ReportSubmit'>;
export type CheckInScreenProps = NativeStackScreenProps<CheckInStackParamList, 'CheckIn'>;
