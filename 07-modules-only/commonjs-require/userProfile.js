const USER_PROFILES = {
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

const DEFAULT_USER_PROFILE = USER_PROFILES.jin;
const userProfiles = Object.values(USER_PROFILES);

function resolveUserProfile(profileId) {
  return USER_PROFILES[profileId] ?? DEFAULT_USER_PROFILE;
}

function introduce(profile) {
  return `${profile.name}님은 ${profile.favoriteTopic}를 배우는 ${profile.level} 학습자입니다.`;
}

module.exports = {
  USER_PROFILES,
  DEFAULT_USER_PROFILE,
  userProfiles,
  resolveUserProfile,
  introduce,
};
