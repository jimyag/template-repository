export type AsyncState<T> = {
  data: T | null;
  error: string;
  loading: boolean;
};
