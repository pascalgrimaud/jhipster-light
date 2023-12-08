export interface ManagementInfo {
  git: GitManagementInfo;
}

export interface GitManagementInfo {
  commit: CommitManagementInfo;
  branch: string;
  release: string;
}

export interface CommitManagementInfo {
  id: IdManagementInfo;
}

export interface IdManagementInfo {
  describe: string;
  abbrev: string;
}
