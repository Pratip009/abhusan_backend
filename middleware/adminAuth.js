import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if the Authorization header is present and well-formed
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
        }

        const token = authHeader.split(" ")[1]; // Extract token from Authorization header

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check user role
        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not Authorized. Admins only." });
        }

        // Attach user info to request object
        req.user = decoded;
        next();
    } catch (error) {
        // Handle different JWT errors
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ success: false, message: "Invalid Token" });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ success: false, message: "Token Expired" });
        }
        // Log any unexpected errors
        console.error("Authorization error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export default adminAuth;
