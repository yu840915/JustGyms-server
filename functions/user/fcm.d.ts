export interface FcmMessageContent {
  title: String;
  body: String;
  data: Object;
}

export interface FcmMessage {
  notification: {
    title: String;
    body: String;
  };
  tokens: [String];
  token: String;
  data: Object;
}
