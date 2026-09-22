const MAX_MESSAGES = 12;
const EXIT_DURATION_MS = 280;

type RupiVariant =
  | "viewer"
  | "member"
  | "moderator"
  | "owner"
  | "superchat"
  | "membership";

const messagesRoot = document.querySelector<HTMLElement>("#rupi-messages");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!messagesRoot) {
  throw new Error("#rupi-messages tidak ditemukan pada HTML overlay.");
}

const messagesElement: HTMLElement = messagesRoot;

const seenIds = new Set<string>();

function getVariant(item: ChatItem): RupiVariant {
  if (item.superchat) return "superchat";
  if (item.membershipDetails) return "membership";
  if (item.isOwner) return "owner";
  if (item.isModerator) return "moderator";
  if (item.isMembership) return "member";
  return "viewer";
}

function appendLinkedText(parent: HTMLElement, value: string): void {
  const urlPattern = /https?:\/\/[^\s<]+/gi;
  let cursor = 0;

  for (const match of value.matchAll(urlPattern)) {
    const index = match.index ?? 0;
    const rawUrl = match[0];
    const url = rawUrl.replace(/[),.!?]+$/g, "");
    const trailing = rawUrl.slice(url.length);

    if (index > cursor) {
      parent.append(document.createTextNode(value.slice(cursor, index)));
    }

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer noopener";
    anchor.textContent = url;
    parent.append(anchor);

    if (trailing) {
      parent.append(document.createTextNode(trailing));
    }

    cursor = index + rawUrl.length;
  }

  if (cursor < value.length) {
    parent.append(document.createTextNode(value.slice(cursor)));
  }
}

function appendMessageParts(
  parent: HTMLElement,
  parts: MessagePart[] | undefined,
  fallback = ""
): void {
  const hasVisibleContent =
    Array.isArray(parts) &&
    parts.some((part) =>
      part.type === "text" ? part.text.trim().length > 0 : part.url.length > 0
    );

  if (!hasVisibleContent || !parts) {
    appendLinkedText(parent, fallback);
    return;
  }

  for (const part of parts) {
    if (part.type === "text") {
      appendLinkedText(parent, part.text);
      continue;
    }

    const image = document.createElement("img");
    image.className =
      part.type === "emoji" ? "rupi-inline-emoji" : "rupi-inline-image";
    image.src = part.url;
    image.alt =
      part.type === "emoji"
        ? part.alt || part.emojiText
        : part.alt || "gambar";
    image.loading = "eager";
    parent.append(image);
  }
}

function createBadgeList(item: ChatItem): HTMLElement | null {
  const badges = document.createElement("span");
  badges.className = "rupi-author-badges";

  const badge = item.author.badge;
  if (badge?.thumbnail?.url) {
    const image = document.createElement("img");
    image.className = "rupi-author-badge-image";
    image.src = badge.thumbnail.url;
    image.alt = badge.label || "badge";
    image.title = badge.label || "";
    badges.append(image);
  } else if (badge?.label) {
    const label = document.createElement("span");
    label.className = "rupi-author-badge-label";
    label.textContent = badge.label;
    badges.append(label);
  }

  if (item.isVerified) {
    const verified = document.createElement("span");
    verified.className = "rupi-verified";
    verified.title = "Verified";
    verified.textContent = "✓";
    badges.append(verified);
  }

  return badges.childElementCount > 0 ? badges : null;
}

function createAuthorHeader(item: ChatItem): HTMLElement {
  const row = document.createElement("header");
  row.className = "rupi-author-row";

  const chip = document.createElement("span");
  chip.className = "rupi-author-chip";

  const name = document.createElement("span");
  name.className = "rupi-author-name";
  name.textContent = item.author.name || "Unknown";
  chip.append(name);

  const badges = createBadgeList(item);
  if (badges) chip.append(badges);

  row.append(chip);

  if (typeof item.viewerLeaderboardRank === "number") {
    const rank = document.createElement("span");
    rank.className = "rupi-rank";
    rank.textContent = `♛ #${item.viewerLeaderboardRank}`;
    row.append(rank);
  }

  return row;
}

function createNormalMessage(item: ChatItem, variant: RupiVariant): HTMLElement {
  const article = document.createElement("article");
  article.className = `rupi-item rupi-chat rupi-chat--${variant}`;
  article.append(createAuthorHeader(item));

  const message = document.createElement("div");
  message.className = "rupi-message";
  appendMessageParts(message, item.message);
  article.append(message);

  return article;
}

function membershipTag(details: MembershipDetails): string {
  switch (details.eventType) {
    case "Milestone":
      return "MILESTONE";
    case "GiftPurchase":
      return "MEMBER GIFT";
    case "GiftRedemption":
      return "GIFT RECEIVED";
    default:
      return "NEW MEMBER";
  }
}

function membershipFallback(details: MembershipDetails): string {
  if (details.headerPrimaryText) return details.headerPrimaryText;
  if (details.eventType === "GiftPurchase" && details.giftCount) {
    return `Menghadiahkan ${details.giftCount} membership!`;
  }
  if (details.eventType === "GiftRedemption") {
    return "Menerima hadiah membership!";
  }
  return "Baru saja bergabung menjadi member!";
}

function createEventMessage(item: ChatItem, variant: RupiVariant): HTMLElement {
  const article = document.createElement("article");
  article.className = `rupi-item rupi-event rupi-event--${variant}`;

  const header = document.createElement("header");
  header.className = "rupi-event-header";

  const identity = document.createElement("div");
  identity.className = "rupi-event-identity";

  const nameRow = document.createElement("div");
  nameRow.className = "rupi-event-name-row";

  const name = document.createElement("strong");
  name.className = "rupi-event-name";
  name.textContent = item.author.name || "Unknown";
  nameRow.append(name);

  const badges = createBadgeList(item);
  if (badges) nameRow.append(badges);

  const meta = document.createElement("span");
  meta.className = "rupi-event-meta";

  if (variant === "superchat") {
    meta.textContent = "mengirim Superchat";
  } else {
    const details = item.membershipDetails;
    meta.textContent = details?.headerSubtext || details?.levelName || "Member";
  }

  identity.append(nameRow, meta);
  header.append(identity);

  if (variant === "superchat" && item.superchat) {
    const amount = document.createElement("span");
    amount.className = "rupi-event-amount";
    amount.textContent = item.superchat.amountString;
    header.append(amount);
  }

  if (variant === "membership" && item.membershipDetails) {
    const tag = document.createElement("span");
    tag.className = "rupi-event-tag";
    tag.textContent = membershipTag(item.membershipDetails);
    header.append(tag);
  }

  const body = document.createElement("div");
  body.className = "rupi-event-body";

  const fallback = item.membershipDetails
    ? membershipFallback(item.membershipDetails)
    : "";
  appendMessageParts(body, item.message, fallback);

  if (item.superchat?.sticker?.url) {
    const sticker = document.createElement("img");
    sticker.className = "rupi-super-sticker";
    sticker.src = item.superchat.sticker.url;
    sticker.alt = item.superchat.sticker.alt || "Super Sticker";
    body.append(sticker);
  }

  article.append(header, body);
  return article;
}

function animateEntrance(element: HTMLElement, variant: RupiVariant): void {
  if (prefersReducedMotion.matches) return;

  const keyframes: Keyframe[] =
    variant === "superchat" || variant === "membership"
      ? [
          { opacity: 0, transform: "translateY(24px) scale(.94)" },
          { opacity: 1, transform: "translateY(0) scale(1)" }
        ]
      : [
          { opacity: 0, transform: "translateX(-30px) scale(.97)" },
          { opacity: 1, transform: "translateX(0) scale(1)" }
        ];

  element.animate(keyframes, {
    duration: variant === "superchat" || variant === "membership" ? 520 : 420,
    easing: "cubic-bezier(.22, 1, .36, 1)",
    fill: "both"
  });
}

function removeWithAnimation(element: HTMLElement): void {
  if (element.dataset.exiting === "true") return;
  element.dataset.exiting = "true";

  if (prefersReducedMotion.matches) {
    element.remove();
    return;
  }

  const animation = element.animate(
    [
      { opacity: 1, transform: "translateX(0) scale(1)", maxHeight: `${element.offsetHeight}px` },
      { opacity: 0, transform: "translateX(-24px) scale(.97)", maxHeight: "0px" }
    ],
    {
      duration: EXIT_DURATION_MS,
      easing: "ease-in",
      fill: "forwards"
    }
  );

  animation.finished
    .catch(() => undefined)
    .finally(() => element.remove());
}

function pruneOldMessages(): void {
  const activeItems = Array.from(
    messagesElement.querySelectorAll<HTMLElement>(".rupi-item:not([data-exiting='true'])")
  );

  while (activeItems.length > MAX_MESSAGES) {
    const oldest = activeItems.shift();
    if (oldest) removeWithAnimation(oldest);
  }
}

function renderChatItem(item: ChatItem): void {
  if (!item || !item.id || seenIds.has(item.id)) return;
  seenIds.add(item.id);

  if (seenIds.size > 500) {
    const oldestId = seenIds.values().next().value;
    if (typeof oldestId === "string") seenIds.delete(oldestId);
  }

  const variant = getVariant(item);
  const element =
    variant === "superchat" || variant === "membership"
      ? createEventMessage(item, variant)
      : createNormalMessage(item, variant);

  element.dataset.messageId = item.id;
  element.dataset.variant = variant;
  if (item.isTicker) element.classList.add("rupi-item--ticker");

  messagesElement.append(element);
  animateEntrance(element, variant);
  pruneOldMessages();
}

window.chat.subscribe(renderChatItem);
