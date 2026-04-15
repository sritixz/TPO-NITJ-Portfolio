import React, { useState } from 'react';
import { Clock, FileText, CreditCard, CheckCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import LTE2MonthForm from './lte2monthform';
const OutsourceInternshipPage = () => {
  const [selectedOption, setSelectedOption] = useState('winterSummer');
  const navigate = useNavigate();

  const winterSummerContent = (
    <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-custom-blue shadow-sm overflow-hidden">
      <div className="bg-custom-blue px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">Winter/Summer Internship</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-white rounded-lg p-4 mb-5 border-l-4 border-custom-blue">
          <p className="text-gray-700 leading-relaxed">
            NITJ is pleased to offer summer/winter internship for both Internal (NITJ students) and External candidates. 
            <span className="font-semibold text-gray-900"> Registration fee: ₹5,000</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-custom-blue font-semibold">
    1
  </div>
  <div className="flex-1">
  <p className="text-gray-700 leading-relaxed">
  Please refer the{' '}
  <a
    href="/Summer - Winter Outsource Intership.xlsx"
    target="_blank"
    rel="noopener noreferrer"
    download
    className="inline-flex items-center gap-1 text-custom-blue hover:underline font-medium"
  >
    attached list
    <ExternalLink size={14} />
  </a>{' '}
  of interested faculty members to mentor summer interns with their respective research areas.
</p>

  </div>
</div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-custom-blue font-semibold">
              2
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed">
                Clearly mention the name of the proposed faculty member, their email ID, contact number, and department at NIT Jalandhar.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-custom-blue font-semibold">
              3
            </div>
          <div className="flex-1">
  <p className="text-gray-700 leading-relaxed">
    Make the required payment of ₹5,000 on NITJ portal and collect the transaction slip.&nbsp;
    <a 
      href="https://dexpertsystems.com/welcome?mid=287"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-custom-blue hover:text-blue-800 font-medium"
    >
      <CreditCard size={14} className="shrink-0" />
      <span>Payment Portal</span>
      <ExternalLink size={14} className="shrink-0" />
    </a>
  </p>
</div>


          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-custom-blue font-semibold">
              4
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed mb-2">Ensure you have these qualifying documents:</p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-custom-blue mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">10th & 12th marksheets</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-custom-blue mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Current UG marksheets</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-custom-blue mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">NOC signed by Head of Department/Principal/Dean</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-custom-blue mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Payment Slip</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-custom-blue font-semibold">
              5
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed">
                Combine all documents into one single PDF file <span className="font-semibold">(max size: 5 MB)</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-custom-blue font-semibold">
              6
            </div>
            <div className="flex-1">
              <p className="text-gray-700 leading-relaxed">
                Apply for Winter/Summer Internship using the button below
              </p>
            </div>
          </div>
        </div>

        <button  onClick={() => navigate("/outsourceInternship/lte2month")} className="mt-6 w-full bg-custom-blue hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
          {/* <FileText size={20} /> */}
          Proceed
        </button>
      </div>
    </div>
  );

  // const moreThan3MonthsContent = (
  //   <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-custom-blue shadow-sm overflow-hidden">
  //     <div className="bg-custom-blue px-6 py-4">
  //       <div className="flex items-center gap-3">
  //         <h3 className="text-xl font-bold text-white">More than 3 Months Internship</h3>
  //       </div>
  //     </div>
      
  //     <div className="p-6">
  //       <div className="space-y-4">
  //         <div className="flex gap-4">
  //           <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
  //             1
  //           </div>
  //           <div className="flex-1">
  //             <p className="text-gray-700 leading-relaxed">
  //               If you wish to do research/project/dissertation/thesis work, select a faculty supervisor at NIT Jalandhar and obtain their recommendation.
  //             </p>
  //           </div>
  //         </div>

  //         <div className="flex gap-4">
  //           <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
  //             2
  //           </div>
  //           <div className="flex-1">
  //             <p className="text-gray-700 leading-relaxed mb-3">Ensure following documents:</p>
  //             <div className="bg-white rounded-lg p-4 space-y-2.5 border border-green-200">
  //               <div className="flex items-start gap-2">
  //                 <CheckCircle size={18} className="text-custom-blue mt-0.5 flex-shrink-0" />
  //                 <span className="text-gray-700">Recommendation from Home University</span>
  //               </div>
  //               <div className="flex items-start gap-2">
  //                 <CheckCircle size={18} className="text-custom-blue mt-0.5 flex-shrink-0" />
  //                 <span className="text-gray-700">Proof of registration at Home University</span>
  //               </div>
  //               <div className="flex items-start gap-2">
  //                 <CheckCircle size={18} className="text-custom-blue mt-0.5 flex-shrink-0" />
  //                 <span className="text-gray-700">Academic Record till last semester</span>
  //               </div>
  //               <div className="flex items-start gap-2">
  //                 <CheckCircle size={18} className="text-custom-blue mt-0.5 flex-shrink-0" />
  //                 <span className="text-gray-700">Academic Record (Transcripts) for foreign students</span>
  //               </div>
  //               <div className="flex items-start gap-2">
  //                 <CheckCircle size={18} className="text-custom-blue mt-0.5 flex-shrink-0" />
  //                 <span className="text-gray-700">Statement of purpose</span>
  //               </div>
  //               <div className="flex items-start gap-2">
  //                 <CheckCircle size={18} className="text-custom-blue mt-0.5 flex-shrink-0" />
  //                 <span className="text-gray-700">Acceptance letter/Recommendation of Supervisor from NIT Jalandhar</span>
  //               </div>
  //               <div className="flex items-start gap-2">
  //                 <CheckCircle size={18} className="text-custom-blue mt-0.5 flex-shrink-0" />
  //                 <span className="text-gray-700">Copy of Passport (for foreign nationals, subject to MEA clearance)</span>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <button onClick={() => navigate("/outsourceInternship/gte3month")} className="mt-6 w-full bg-custom-blue to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
  //         Proceed
  //       </button>
  //     </div>
  //   </div>
  // );
    

  const moreThan3MonthsContent = (
  <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-custom-blue shadow-sm overflow-hidden">
    <div className="bg-custom-blue px-6 py-4">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-bold text-white">
          More than 3 Months Internship
        </h3>
      </div>
    </div>

    <div className="p-6">
      <div className="space-y-6">

        {/* POINT 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
            1
          </div>
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed">
              If you wish to do research/project/dissertation/thesis work, select a faculty supervisor at NIT Jalandhar and obtain their recommendation.
            </p>
          </div>
        </div>

        {/* POINT 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
            2
          </div>
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed mb-3">
              Ensure following documents:
            </p>

            <div className="bg-white rounded-lg p-4 space-y-2.5 border border-green-200">
              {[
                "Recommendation from Home University",
                "Proof of registration at Home University",
                "Academic Record till last semester",
                "Academic Record (Transcripts) for foreign students",
                "Statement of purpose",
                "Acceptance letter/Recommendation of Supervisor from NIT Jalandhar",
                "Copy of Passport (for foreign nationals, subject to MEA clearance)",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-custom-blue mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* POINT 3 – FEE STRUCTURE */}
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
            3
          </div>

          <div className="flex-1">
            <p className="text-gray-700 font-semibold mb-3">
              Fee Structure for External Students:
            </p>

            {/* Tuition Fee Table */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-sm">
                <thead className="bg-custom-blue text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Course</th>
                    <th className="px-4 py-2 text-left">Tuition Fees</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-t">
                    <td className="px-4 py-2">B.Tech</td>
                    <td className="px-4 py-2">
                      50% of ₹62,500 per semester = <strong>₹31,250</strong>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-4 py-2">M.Tech</td>
                    <td className="px-4 py-2">
                      50% of ₹35,000 per semester = <strong>₹17,500</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Duration Charges */}
            <div className="bg-white rounded-lg p-4 border border-green-200 space-y-2">
              <p className="font-semibold text-gray-800">
                Internship Duration & Charges:
              </p>

              <p className="text-gray-700">
                • <strong>1–2 Months:</strong> ₹10,000 + hostel & other charges (if applicable)
              </p>

              <p className="text-gray-700">
                • <strong>2–6 Months:</strong> 50% of tuition fee + ₹1,000 internet charges + hostel & other charges
              </p>

              <p className="text-gray-700">
                • <strong>6 Months – 1 Year:</strong> 50% of two semester tuition fee + ₹2,000 internet charges + hostel & other charges
              </p>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              * 25% of tuition fee will be charged for students from institutes having MoU with NIT Jalandhar.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/outsourceInternship/gte3month")}
        className="mt-6 w-full bg-custom-blue hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        Proceed
      </button>
    </div>
  </div>
);



  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Internship <span className='text-custom-blue'>Opportunities</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setSelectedOption('moreThan3Months')}
            className={`p-4 rounded-lg font-semibold transition-colors ${
              selectedOption === 'moreThan3Months'
                ? 'bg-custom-blue text-white'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
            }`}
          >
            More than 3 Month Internship
          </button>
          <button
            onClick={() => setSelectedOption('winterSummer')}
            className={`p-4 rounded-lg font-semibold transition-colors ${
              selectedOption === 'winterSummer'
                ? 'bg-custom-blue text-white'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
            }`}
          >
            Winter/Summer Internship
          </button>
        </div>
        {selectedOption === 'moreThan3Months' && moreThan3MonthsContent}
        {selectedOption === 'winterSummer' && winterSummerContent}
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate("/outsourceInternship/login")}
          className="bg-custom-blue hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          Login for Outsider Students
        </button>
      </div>
    </div>
  );
};

export default OutsourceInternshipPage;