export const USER_PROFILES = {
  jin: {
    id: "jin",
    name: "Jin",
    level: "beginner",
    favoriteTopic: "Node.js modules",
    introduce() {
      return `${this.name}님은 ${this.favoriteTopic}를 배우는 ${this.level} 학습자입니다.`;
    },
    isBeginner() {
      return this.level === "beginner";
    },
  },
  mina: {
    id: "mina",
    name: "Mina",
    level: "intermediate",
    favoriteTopic: "Express Router",
    introduce() {
      return `${this.name}님은 ${this.favoriteTopic}를 배우는 ${this.level} 학습자입니다.`;
    },
    isBeginner() {
      return this.level === "beginner";
    },
  },
};

export const DEFAULT_USER_PROFILE = USER_PROFILES.jin;
export const userProfiles = Object.values(USER_PROFILES);

export function resolveUserProfile(profileId) {
  return USER_PROFILES[profileId] ?? DEFAULT_USER_PROFILE;
}
