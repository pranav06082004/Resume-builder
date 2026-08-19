import jwt from 'jsonwebtoken'

const protect =async (req, res, next)=>{
    const token =req.headers.authorization;
    console.log('🔐 Auth check:', { hasToken: !!token, path: req.path });
    
    if(!token){
        console.error('❌ No token provided');
        return res.status(401).json({message: 'Unauthorized'});
    }
    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET)
        req.userId =decoded.userId;
        console.log('✅ Token verified, userId:', decoded.userId);
        next();
    }
    catch(error){
        console.error('❌ Token verification failed:', error.message);
        return res.status(401).json({message: 'Unauthorized'});
    }
}
export { protect };