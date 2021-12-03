import { DocumentReference } from '../firestoreTypes';

export interface User {
  name: String;
  cover: String;
  fcmTokens?: [String];
  fcmTopics: [String];
  roles: [Role]
}

export type Role = 'superuser' | 'admin'

export interface Favorites {
  user: DocumentReference;
  gyms: [String];
  trainers: [DocumentReference];
}
