"use strict";
const MAX_MESSAGES = 12;
const EXIT_DURATION_MS = 360;
const ASSET_BASE = "https://cdn.jsdelivr.net/gh/demnih/RupiNephore@01d1594/Asset/%5B%20assets%20%5D";
const PILL_ORNAMENTS = [
    { color: "Blue", url: `${ASSET_BASE}/blue%20pill.png` },
    { color: "Pink", url: `${ASSET_BASE}/pink%20pill.png` },
    { color: "Purple", url: `${ASSET_BASE}/purple%20pill.png` }
];
const TABLET_ORNAMENTS = [
    { color: "Blue", url: `${ASSET_BASE}/blue%20tablet.png` },
    { color: "Pink", url: `${ASSET_BASE}/pink%20tablet.png` },
    { color: "Purple", url: `${ASSET_BASE}/purple%20tablet.png` }
];
let previousPillIndex = -1;
let previousTabletIndex = -1;
const messagesRoot = document.querySelector("#rupi-messages");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!messagesRoot) {
    throw new Error("#rupi-messages tidak ditemukan pada HTML overlay.");
}
const messagesElement = messagesRoot;
const seenIds = new Set();
function getVariant(item) {
    if (item.superchat)
        return "superchat";
    if (item.membershipDetails)
        return "membership";
    if (item.isOwner)
        return "owner";
    if (item.isModerator)
        return "moderator";
    if (item.isMembership)
        return "member";
    return "viewer";
}
function randomIndexExcept(length, previousIndex) {
    let index = Math.floor(Math.random() * length);
    if (length > 1 && index === previousIndex) {
        index = (index + 1 + Math.floor(Math.random() * (length - 1))) % length;
    }
    return index;
}
function createOrnament(option, shape) {
    const rotation = shape === "pill"
        ? Math.round(Math.random() * 20 - 14)
        : Math.round(Math.random() * 24 - 12);
    const ornament = document.createElement("img");
    ornament.className = `rupi-ornament rupi-ornament--${shape}`;
    ornament.src = option.url;
    ornament.alt = "";
    ornament.title = `${option.color} ${shape}`;
    ornament.loading = "eager";
    ornament.dataset.placement = shape === "pill" ? "top-left" : "bottom-right";
    ornament.dataset.rotation = String(rotation);
    ornament.style.setProperty("--ornament-rotation", `${rotation}deg`);
    ornament.setAttribute("aria-hidden", "true");
    return ornament;
}
function createRandomOrnaments() {
    const pillIndex = randomIndexExcept(PILL_ORNAMENTS.length, previousPillIndex);
    const tabletIndex = randomIndexExcept(TABLET_ORNAMENTS.length, previousTabletIndex);
    previousPillIndex = pillIndex;
    previousTabletIndex = tabletIndex;
    return [
        createOrnament(PILL_ORNAMENTS[pillIndex], "pill"),
        createOrnament(TABLET_ORNAMENTS[tabletIndex], "tablet")
    ];
}
function appendLinkedText(parent, value) {
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
function appendMessageParts(parent, parts, fallback = "") {
    const hasVisibleContent = Array.isArray(parts) &&
        parts.some((part) => part.type === "text" ? part.text.trim().length > 0 : part.url.length > 0);
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
function createBadgeList(item) {
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
    }
    else if (badge?.label) {
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
function createAuthorHeader(item) {
    const row = document.createElement("header");
    row.className = "rupi-author-row";
    const chip = document.createElement("span");
    chip.className = "rupi-author-chip";
    const name = document.createElement("span");
    name.className = "rupi-author-name";
    name.textContent = item.author.name || "Unknown";
    chip.append(name);
    const badges = createBadgeList(item);
    if (badges)
        chip.append(badges);
    row.append(chip);
    if (typeof item.viewerLeaderboardRank === "number") {
        const rank = document.createElement("span");
        rank.className = "rupi-rank";
        rank.textContent = `♛ #${item.viewerLeaderboardRank}`;
        row.append(rank);
    }
    return row;
}
function createNormalMessage(item, variant) {
    const article = document.createElement("article");
    article.className = `rupi-item rupi-chat rupi-chat--${variant}`;
    article.append(createAuthorHeader(item));
    const message = document.createElement("div");
    message.className = "rupi-message";
    appendMessageParts(message, item.message);
    article.append(message, ...createRandomOrnaments());
    return article;
}
function membershipTag(details) {
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
function membershipFallback(details) {
    if (details.headerPrimaryText)
        return details.headerPrimaryText;
    if (details.eventType === "GiftPurchase" && details.giftCount) {
        return `Menghadiahkan ${details.giftCount} membership!`;
    }
    if (details.eventType === "GiftRedemption") {
        return "Menerima hadiah membership!";
    }
    return "Baru saja bergabung menjadi member!";
}
function createEventMessage(item, variant) {
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
    if (badges)
        nameRow.append(badges);
    const meta = document.createElement("span");
    meta.className = "rupi-event-meta";
    if (variant === "superchat") {
        meta.textContent = "mengirim Superchat";
    }
    else {
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
function startOrnamentIdleAnimation(ornament) {
    if (prefersReducedMotion.matches || !ornament.isConnected)
        return;
    const rotation = Number(ornament.dataset.rotation || 0);
    const direction = Math.random() > 0.5 ? 1 : -1;
    ornament.animate([
        { transform: `translateY(0) rotate(${rotation}deg) scale(1)` },
        { transform: `translateY(-4px) rotate(${rotation + 7 * direction}deg) scale(1.06)` },
        { transform: `translateY(1px) rotate(${rotation - 3 * direction}deg) scale(.98)` },
        { transform: `translateY(0) rotate(${rotation}deg) scale(1)` }
    ], {
        duration: 2400 + Math.round(Math.random() * 900),
        easing: "ease-in-out",
        iterations: Infinity
    });
}
function animateOrnamentsEntrance(element) {
    const ornaments = element.querySelectorAll(".rupi-ornament");
    if (ornaments.length === 0 || prefersReducedMotion.matches)
        return;
    ornaments.forEach((ornament, index) => {
        const rotation = Number(ornament.dataset.rotation || 0);
        const isTopLeft = ornament.dataset.placement === "top-left";
        const startX = isTopLeft ? -12 : 10;
        const startY = isTopLeft ? -10 : 12;
        const startRotation = isTopLeft ? rotation + 35 : rotation - 35;
        const overshootRotation = isTopLeft ? rotation - 11 : rotation + 12;
        const animation = ornament.animate([
            {
                opacity: 0,
                transform: `translate(${startX}px, ${startY}px) rotate(${startRotation}deg) scale(.2)`
            },
            {
                opacity: 1,
                transform: `translate(${isTopLeft ? 2 : -2}px, -3px) rotate(${overshootRotation}deg) scale(1.18)`,
                offset: 0.72
            },
            {
                opacity: 1,
                transform: `translate(0, 0) rotate(${rotation}deg) scale(1)`
            }
        ], {
            delay: 90 + index * 90,
            duration: 560,
            easing: "cubic-bezier(.2, .9, .25, 1.25)",
            fill: "both"
        });
        animation.finished
            .then(() => {
            if (element.dataset.exiting !== "true") {
                startOrnamentIdleAnimation(ornament);
            }
        })
            .catch(() => undefined);
    });
}
function animateEntrance(element, variant) {
    if (prefersReducedMotion.matches)
        return;
    const keyframes = variant === "superchat" || variant === "membership"
        ? [
            { opacity: 0, transform: "translateY(30px) rotate(-1deg) scale(.9)" },
            { opacity: 1, transform: "translateY(-4px) rotate(.35deg) scale(1.025)", offset: 0.72 },
            { opacity: 1, transform: "translateY(0) scale(1)" }
        ]
        : [
            { opacity: 0, transform: "translateX(-42px) rotate(-1.5deg) scale(.88)" },
            { opacity: 1, transform: "translateX(6px) rotate(.45deg) scale(1.025)", offset: 0.7 },
            { opacity: 1, transform: "translateX(0) scale(1)" }
        ];
    element.animate(keyframes, {
        duration: variant === "superchat" || variant === "membership" ? 620 : 520,
        easing: "cubic-bezier(.2, .85, .25, 1.15)",
        fill: "both"
    });
    animateOrnamentsEntrance(element);
}
function removeWithAnimation(element) {
    if (element.dataset.exiting === "true")
        return;
    element.dataset.exiting = "true";
    if (prefersReducedMotion.matches) {
        element.remove();
        return;
    }
    element.getAnimations().forEach((animation) => animation.cancel());
    const ornaments = element.querySelectorAll(".rupi-ornament");
    ornaments.forEach((ornament) => {
        ornament.getAnimations().forEach((animation) => animation.cancel());
        const rotation = Number(ornament.dataset.rotation || 0);
        const isTopLeft = ornament.dataset.placement === "top-left";
        ornament.animate([
            { opacity: 1, transform: `translate(0, 0) rotate(${rotation}deg) scale(1)` },
            {
                opacity: 0,
                transform: `translate(${isTopLeft ? -14 : 14}px, -12px) rotate(${rotation + (isTopLeft ? -42 : 42)}deg) scale(.25)`
            }
        ], {
            duration: EXIT_DURATION_MS,
            easing: "cubic-bezier(.55, 0, 1, .45)",
            fill: "forwards"
        });
    });
    const marginBottom = getComputedStyle(element).marginBottom;
    const animation = element.animate([
        {
            opacity: 1,
            transform: "translateX(0) rotate(0) scale(1)",
            maxHeight: `${element.offsetHeight}px`,
            marginBottom
        },
        {
            opacity: 1,
            transform: "translateX(8px) rotate(.5deg) scale(1.015)",
            offset: 0.28
        },
        {
            opacity: 0,
            transform: "translateX(-48px) rotate(-2deg) scale(.9)",
            maxHeight: "0px",
            marginBottom: "0px"
        }
    ], {
        duration: EXIT_DURATION_MS,
        easing: "ease-in",
        fill: "forwards"
    });
    animation.finished
        .catch(() => undefined)
        .finally(() => element.remove());
}
function pruneOldMessages() {
    const activeItems = Array.from(messagesElement.querySelectorAll(".rupi-item:not([data-exiting='true'])"));
    while (activeItems.length > MAX_MESSAGES) {
        const oldest = activeItems.shift();
        if (oldest)
            removeWithAnimation(oldest);
    }
}
function renderChatItem(item) {
    if (!item || !item.id || seenIds.has(item.id))
        return;
    seenIds.add(item.id);
    if (seenIds.size > 500) {
        const oldestId = seenIds.values().next().value;
        if (typeof oldestId === "string")
            seenIds.delete(oldestId);
    }
    const variant = getVariant(item);
    const element = variant === "superchat" || variant === "membership"
        ? createEventMessage(item, variant)
        : createNormalMessage(item, variant);
    element.dataset.messageId = item.id;
    element.dataset.variant = variant;
    if (item.isTicker)
        element.classList.add("rupi-item--ticker");
    messagesElement.append(element);
    animateEntrance(element, variant);
    pruneOldMessages();
}
window.chat.subscribe(renderChatItem);
