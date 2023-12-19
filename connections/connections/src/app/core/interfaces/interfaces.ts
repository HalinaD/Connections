export interface UserProfile {
  email: { S: string };
  name: { S: string };
  uid: { S: string };
  createdAt: { S: string };
}

export interface Group {
  id: { S: string };
  name: { S: string };
  createdAt: { S: string };
  createdBy: { S: string };
}

export interface Person {
  name: { S: string };
  uid: { S: string };
}

export interface Conversation {
  id: { S: string };
  companionID: { S: string };
}

export interface Response<T> {
  Count: number;
  Items: T[];
}

export interface GroupMessage {
  userName: string;
  authorID: { S: string };
  message: { S: string };
  createdAt: { S: string };
}

export interface GroupResponse {
  Count: number;
  Items: GroupMessage[];
}

export interface PersonResponse {
  Count: number;
  Items: Person[];
}

export interface ApiResponse<T> {
  Count: number;
  Items: T[];
}

export interface PersonalMessage {
  userName: string;
  authorID: { S: string };
  message: { S: string };
  createdAt: { S: string };
}

export interface ConversationResponse {
  Count: number;
  Items: PersonalMessage[];
}

export interface RegistrationResponse {
  success: boolean;
  message?: string;
}
