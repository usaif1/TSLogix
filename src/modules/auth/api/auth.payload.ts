export type RegisterOrganisation = {
  userId: string;
  email: string;
  plainPassword: string;
  roleName: string;
  organisation_id: string;
};

export type LoginPayload = {
  userId: string;
  password: string;
};
