export type RootStackParamList = {
  Home: undefined;
  AddItem: undefined;
  ItemDetails: { itemId: string };
  DaySummary: { date: string };
  EditItem: { itemId: string };
};
