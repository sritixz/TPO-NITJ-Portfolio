import Recuiter from "../models/user_model/recuiter.js";
import Professor from "../models/user_model/professor.js";
import Student from "../models/user_model/student.js";
import Alumni from "../models/user_model/alumni.js";
import Admin from "../models/user_model/admin.js";
import Department from "../models/user_model/department.js"
import Outsider from "../models/user_model/outsider.js";
export const checkAuth = async (req, res) => {
  const student= await Student.findById(req.user.userId);
  const professor= await Professor.findById(req.user.userId);
  const recuiter= await Recuiter.findById(req.user.userId);
  const admin= await Admin.findById(req.user.userId);
  const department= await Department.findById(req.user.userId);
  const alumni= await Alumni.findById(req.user.userId);
  const outsider= await Outsider.findById(req.user.userId);
  
   if (!student && !recuiter && !professor && !alumni && !admin && !department && !outsider) {
       return res.status(401).json({ message: "User not found" });
   }
  const user = student || recuiter || professor || alumni || admin || department || outsider;
  res.status(200).json({ message: 'Authenticated', user: user, userType:req.user.userType });
}