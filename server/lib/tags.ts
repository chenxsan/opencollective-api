export const validateTags = (tags: string[]): void => {
  if (tags) {
    // Limit to max 30 tags
    if (tags.length > 30) {
      throw new Error(`Conversations cannot have more than 30 tags. Please remove ${30 - tags.length} tag(s).`);
    }

    // Validate each individual tags
    tags.forEach(tag => {
      if (tag.length === 0) {
        throw new Error("Can't add empty tags");
      } else if (tag.length > 32) {
        throw new Error(`Tag ${tag} is too long, must me shorter than 32 characters`);
      }
    });
  }
};
