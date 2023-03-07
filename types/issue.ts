export type User = {
  avatar_url?: string;
  events_url?: string;
  followers_url?: string;
  following_url?: string;
  gists_url?: string;
  gravatar_id?: string;
  html_url?: string;
  id?: number;
  login?: string;
  node_id?: string;
  organizations_url?: string;
  received_events_url?: string;
  repos_url?: string;
  site_admin?: boolean;
  starred_url?: string;
  subscriptions_url?: string;
  type?: 'User';
  url?: string;
};

export type Reactions = {
  '+1'?: number;
  '-1'?: number;
  confused?: number;
  eyes?: number;
  heart?: number;
  hooray?: number;
  laugh?: number;
  rocket?: number;
  total_count?: number;
  url?: string;
};

export type Issue = {
  active_lock_reason?: null;
  assignee?: User | null;
  assignees?: User[];
  author_association?: 'NONE';
  body?: string;
  closed_at?: unknown;
  comments?: number;
  comments_url?: string;
  created_at?: string;
  events_url?: string;
  html_url?: string;
  id?: number;
  labels?: string[];
  labels_url?: string;
  locked?: boolean;
  milestone?: unknown;
  node_id?: string;
  number?: number;
  performed_via_github_app?: unknown;
  reactions?: Reactions;
  repository_url?: string;
  state?: 'open' | 'closed';
  state_reason?: unknown;
  timeline_url?: string;
  title?: string;
  updated_at?: string;
  url?: string;
  user?: User;
};

export type PullRequest = {
  url?: string;
  html_url?: string;
  diff_url?: string;
  patch_url?: string;
  merged_at?: unknown;
};

export type PullRequestIssue = Issue & {
  draft?: boolean;
  pull_request?: PullRequest;
};
