import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    // 1. Get the token from the cookies.
    // Make sure 'cookie-parser' is installed and used in your main server file.
    const token = req.cookies.token;

    // 2. If no token is found in the cookies, return a 401 Unauthorized error.
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Please log in again.",
      });
    }

    // 3. Verify the token using your JWT secret.
    // If the token is invalid or expired, this line will throw an error
    // and the code will jump to the 'catch' block.
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded user ID to the request object.
    // Use req.userId (or req.user) instead of req.body.userId.
    req.userId = tokenDecode.Id;

    // 5. Call 'next()' to pass control to the next middleware or route handler.
    // This is crucial for the request to proceed.
    next();
  } catch (error) {
    // 6. Handle any errors from jwt.verify (e.g., invalid signature, expired token).
    console.error("JWT verification failed:", error.message);

    // Return a 401 Unauthorized status for all authentication errors.
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

export default userAuth;




/*import jwt from "jsonwebtoken";




const userAuth = async (req, res, next) => {
  const {token}  = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized. Login Again",
    })
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.body.userId= tokenDecode.id
      //console.log(tokenDecode.id);
     
    
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid  token.. Login Again",
      });
    }
     next();
    
  } catch (error) {
    console.error("JWT verification failed",error);
    return res.status(401).json({ success: false, message: error.message });
    
  }
  
};

export default userAuth;
*/
