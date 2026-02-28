// backend/utils/socketHelpers.js

/**
 * Notify all cluster members via Socket.IO
 * @param {object} io - Socket.IO server instance
 * @param {Array} clusterMembers - Array of user ObjectIds (citizen IDs)
 * @param {object} message - The message to emit (should include status, etc.)
 */
export function notifyClusterMembers(io, clusterMembers, message) {
    if (!io || !Array.isArray(clusterMembers)) return;
    clusterMembers.forEach((memberId) => {
        io.to(memberId.toString()).emit('status_updated', message);
    });
}
