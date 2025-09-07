import jwt from "jsonwebtoken";




const userAuth = async (req, res, next) => {
  const token  = req.header("Authorization")?.replace("Bearer","");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized. Login Again",
    })
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.params.id= tokenDecode.id;
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
