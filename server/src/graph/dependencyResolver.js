export const topologicalSort = (topics) => {
  const adjacency = {};
  const inDegree = {};

  // Initialize
  topics.forEach((topic) => {
    adjacency[topic._id] = [];
    inDegree[topic._id] = 0;
  });

  // Build graph
  topics.forEach((topic) => {
    topic.prerequisites.forEach((pre) => {
      adjacency[pre.toString()].push(topic._id.toString());
      inDegree[topic._id]++;
    });
  });

  const queue = [];
  const sorted = [];

  Object.keys(inDegree).forEach((id) => {
    if (inDegree[id] === 0) queue.push(id);
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

  if (sorted.length !== topics.length) {
    throw new Error("Circular dependency detected");
  }

  return sorted;
};