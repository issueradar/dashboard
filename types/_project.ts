import type { Post, Project, User } from "@prisma/client";

export interface AdjacentPost
  extends Pick<
    Post,
    "createdAt" | "description" | "image" | "imageBlurhash" | "slug" | "title"
  > {}

export interface _ProjectData extends Project {
  user: User | null;
  font: "font-cal" | "font-lora" | "font-work";
  posts: Array<Post>;
}

export interface _ProjectSlugData extends Post {
  project: _ProjectProject | null;
}

interface _ProjectProject extends Project {
  user: User | null;
}
