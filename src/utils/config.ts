type Environment = "development" | "staging" | "production";

const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV as Environment;
  return env || "development";
};

export const getBaseUrl = (): string => {
  const environment = getEnvironment();

  switch (environment) {
    case "development":
      return (
        process.env.NEXT_PUBLIC_API_BASE_URL_DEV || "http://localhost:7000/api"
      );
    case "staging":
      return (
        process.env.NEXT_PUBLIC_API_BASE_URL_STAGING ||
        "https://staging-api.edustack.com/api"
      );
    case "production":
      return (
        process.env.NEXT_PUBLIC_API_BASE_URL_PROD ||
        "https://api.edustack.com/api"
      );
    default:
      return "http://localhost:3001/api";
  }
};

export const config = {
  apiBaseUrl: getBaseUrl(),
  appName: process.env.NEXT_PUBLIC_APP_NAME || "EduStack",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  environment: getEnvironment(),
};
