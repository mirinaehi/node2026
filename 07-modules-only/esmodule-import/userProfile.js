export const USER_PROFILES = {
  jin: {
    id: "jin",
    name: "Jin",
    level: "beginner",
    favoriteTopic: "Node.js modules",
  },
  mina: {
    id: "mina",
    name: "Mina",
    level: "intermediate",
    favoriteTopic: "Express Router",
  },
};

export const DEFAULT_USER_PROFILE = USER_PROFILES.jin;
export const userProfiles = Object.values(USER_PROFILES);

export function resolveUserProfile(profileId) {
  return USER_PROFILES[profileId] ?? DEFAULT_USER_PROFILE;
}

export function introduce(profile) {
  return `${profile.name}님은 ${profile.favoriteTopic}를 배우는 ${profile.level} 학습자입니다.`;
}
