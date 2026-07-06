export type RootStackParamList = {
  Login: undefined;
  CommunityList: undefined;
  CommunityDetail: { communityId: string };
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
