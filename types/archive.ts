/** Media shape returned inside archive payloads. */
export type ArchivePostMedia = {
  content_type: string;
  category: string;
  position: number;
  media_key: string;
  media_url: string;
  thumbnail_url: string;
};

/** An archive as it appears in a list / on the profile. */
export type ArchiveSummary = {
  id: number;
  name: string;
  emoji: string;
  cover_url: string;
  item_count: number;
  /** Media of the first item's post; `[]` when the archive is empty. */
  preview: ArchivePostMedia[];
};

/** One instant post inside an archive. `id` is the post id. */
export type ArchiveItem = {
  id: number;
  position: number;
  media: ArchivePostMedia[];
};

export type ArchiveDetail = ArchiveSummary & { items: ArchiveItem[] };

/** A candidate archived instant to add to an archive. `id` is the post id. */
export type ArchiveInstantPick = {
  id: number;
  media: ArchivePostMedia[];
};
