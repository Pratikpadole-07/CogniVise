export const topologicalSort = (topics) => {
  const adjacency = {};
  const inDegree = {};

  // Initialize structures
  topics.forEach((topic) => {
    const id = topic._id.toString();
    adjacency[id] = [];
    inDegree[id] = 0;
  });

  // Build graph edges
  topics.forEach((topic) => {
    const topicId = topic._id.toString();

    topic.prerequisites.forEach((pre) => {
      const preId = pre._id.toString();

      adjacency[preId].push(topicId);
      inDegree[topicId]++;
    });
  });

  const queue = [];
  const sorted = [];

  // Add nodes with no prerequisites
  Object.keys(inDegree).forEach((id) => {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift();
    sorted.push(current);

    adjacency[current].forEach((neighbor) => {
      inDegree[neighbor]--;

      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Detect circular dependency
  if (sorted.length !== topics.length) {
    throw new Error("Circular topic dependency detected");
  }

  return sorted;
};