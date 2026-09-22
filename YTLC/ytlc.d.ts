type MembershipEventType =
  | "Unknown"
  | "New"
  | "Milestone"
  | "GiftPurchase"
  | "GiftRedemption";

interface ImagePart {
  type: "image";
  url: string;
  alt?: string;
}

interface EmojiPart {
  type: "emoji";
  url: string;
  alt?: string;
  emojiText: string;
  isCustomEmoji: boolean;
}

interface TextPart {
  type: "text";
  text: string;
}

type MessagePart = TextPart | EmojiPart | ImagePart;

interface Badge {
  label: string;
  thumbnail?: ImagePart;
}

interface Author {
  name: string;
  channelId: string;
  thumbnail?: ImagePart;
  badge?: Badge;
}

interface Superchat {
  amountString: string;
  amountValue: number;
  currency: string;
  bodyBackgroundColor: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  bodyTextColor?: string;
  authorNameTextColor?: string;
  sticker?: ImagePart;
}

interface MembershipDetails {
  eventType: MembershipEventType;
  levelName: string;
  membershipBadgeLabel?: string;
  headerPrimaryText?: string;
  headerSubtext?: string;
  milestoneMonths?: number;
  gifterUsername?: string;
  giftCount?: number;
  recipientUsername?: string;
}

interface ChatItem {
  id: string;
  author: Author;
  message: MessagePart[];
  superchat?: Superchat;
  membershipDetails?: MembershipDetails;
  isMembership: boolean;
  isVerified: boolean;
  isOwner: boolean;
  isModerator: boolean;
  timestamp: Date;
  viewerLeaderboardRank?: number;
  isTicker: boolean;
}

interface ChatStartOptions {
  handle?: string;
  channelId?: string;
  liveId?: string;
  overwrite?: boolean;
}

interface ChatDummyOptions {
  mode?: "random" | "text" | "membership" | "superchat" | "sticker";
  text?: string;
  authorName?: string;
  amount?: number;
  currency?: string;
}

interface WindowChat {
  subscribe(callback: (chatItem: ChatItem) => void): () => void;
  start(options?: ChatStartOptions): void;
  stop(): void;
  sendDummy(options?: ChatDummyOptions): void;
}

interface Window {
  chat: WindowChat;
}
