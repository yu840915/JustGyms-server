import { DocumentReference } from '../firestoreTypes';

export interface User {
  name: String;
  cover: String;
  fcmTokens?: [String];
  fcmTopics: [String];
}

export interface Favorites {
  user: DocumentReference;
  gyms: [String];
  trainers: [DocumentReference];
}
