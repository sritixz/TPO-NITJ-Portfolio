import ContactForm from "../models/contactus.js";
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, department, message } = req.body;

    const newContactForm = new ContactForm({
      name,
      email,
      phone,
      department,
      message,
    });

    await newContactForm.save();

    res.status(201).json({ message: 'Your message has been sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while submitting the form.', error });
  }
};


export const getContactForms = async (req, res) => {
    try {
      const contactForms = await ContactForm.find().sort({ createdAt: -1 }); // Sort by latest first
  
      const categorizedForms = contactForms.reduce((acc, form) => {
        const { department } = form;
        if (!acc[department]) {
          acc[department] = [];
        }
        acc[department].push(form);
        return acc;
      }, {});
  
      res.status(200).json(categorizedForms);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching contact forms.', error });
    }
  };


  export const deleteContactForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedForm = await ContactForm.findByIdAndDelete(id);
    
    if (!deletedForm) {
      return res.status(404).json({ message: 'Contact form not found' });
    }
    
    res.status(200).json({ message: 'Contact form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while deleting the contact form', error });
  }
};