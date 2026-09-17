export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
};

export type Crew = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
};

export type LogRow = {
  id: string;
  crew_id: string;
  user_id: string;
  activity: string;
  logged_at: string;
};

export type RosterMember = {
  id: string;
  name: string;
};
