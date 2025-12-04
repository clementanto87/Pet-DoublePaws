export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
  SitterProfile: { sitter: any };
  Booking: { sitter: any };
  BecomeSitter: undefined;
  SitterRegistration: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: { service?: string };
  Bookings: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

