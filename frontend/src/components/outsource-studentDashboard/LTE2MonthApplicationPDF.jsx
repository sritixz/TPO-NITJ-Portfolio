import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Line,
} from '@react-pdf/renderer';

import Logo from "../../assets/nitj-logo.png"; 


const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
  },
  header: {
    fontSize: 10,
    marginBottom: 10,
  },
  headerLogo: {
    width: 70,
    height: 70, // Adjust size as needed
  },
  headerTextContainer: {
    marginTop: 7,
    flex: 1,
    marginLeft: 5,
  },
  subHeader: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  value: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  headerRow: {
    backgroundColor: '#f0f0f0',
  },
  tableColHeader: {
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 5,
    width: '33%',
  },
  tableCol: {
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 5,
    width: '33%',
  },
  declaration: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 11,
    lineHeight: 1.2,
  },
  signature: {
    marginTop: 20,
    textAlign: 'right',
  },
  imagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  image: {
    width: 80,
    height: 100,
  },
});

const LTE2MonthApplicationPDF = ({ application, baseURL = '' }) => { 
    console.log('Component received - photo:', application.photo ? `${application.photo.format}, ${application.photo.data?.length} bytes` : 'null');
  console.log('Component received - signature:', application.signature ? `${application.signature.format}, ${application.signature.data?.length} bytes` : 'null');
  const {
    departmentAppliedFor,
    proposedFacultyMember,
    proposedFacultyMemberEmail,
    proposedFacultyMemberContact,
    name,
    institution,
    course,
    presentSemester,
    branch,
    postalAddress,
    permanentAddress,
    mobileNo,
    email,
    fathersName,
    gender,
    dateOfBirth,
    nationality,
    overallCGPA,
    educationQualifications,
    photo, // base64 or null
    signature, // filename/path; will be prefixed with baseURL
    documents, // perhaps not embed, or if image
  } = application;

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

  // Prepare table data
  const tableHeader = ['Examination Passed', 'Year of Passing', '% of Marks / SGPA'];
  const tableRows = educationQualifications.map((qual) => [
    qual.semester,
    qual.yearOfPassing,
    qual.percentageOrSGPA,
  ]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo on Left */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Image style={styles.headerLogo} source={Logo} />
            <View style={styles.headerTextContainer}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 3 }}>Dr B R Ambedkar National Institute of Technology, Jalandhar</Text>
              <Text style={{ fontSize: 10, fontWeight: 'normal', textAlign: 'center', marginBottom: 3 }}>(An Institute of National Importance under Ministry of Education, Govt. of India)</Text>
              <Text style={{ fontSize: 10, fontWeight: 'normal', textAlign: 'center', marginBottom: 7 }}>G T Road, Bye Pass, Jalandhar – 144008 (Punjab) India</Text>
              <Text style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>Centre for Training & Placement</Text>
            </View>
          </View>
        </View>

        {/* Double line after heading */}
        <View style={{ marginBottom: 20 }}>
  <Svg width={515} height={8}>
    <Line x1={0} y1={2} x2={520} y2={2} stroke="#000" strokeWidth={1} />
    <Line x1={0} y1={6} x2={520} y2={6} stroke="#000" strokeWidth={2} />
  </Svg>
</View>


        {/* Department and Faculty */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Department Applied for:</Text>
            <Text style={styles.value}>{departmentAppliedFor}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Name of the Proposed Faculty Member:</Text>
            <Text style={styles.value}>{proposedFacultyMember}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email of the Proposed Faculty Member:</Text>
            <Text style={styles.value}>{proposedFacultyMemberEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact of the Proposed Faculty Member:</Text>
            <Text style={styles.value}>{proposedFacultyMemberContact}</Text>
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Name of the Applicant:</Text>
            <Text style={styles.value}>{name}</Text>
          </View>
            <View style={styles.row}>
            <Text style={styles.label}>Institution/University:</Text>
            <Text style={styles.value}>{institution}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Branch:</Text>
            <Text style={styles.value}>{branch}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Course:</Text>
            <Text style={styles.value}>{course}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Present Semester:</Text>
            <Text style={styles.value}>{presentSemester}</Text>
          </View>
           <View style={styles.row}>
            <Text style={styles.label}>Mobile No.:</Text>
            <Text style={styles.value}>{mobileNo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{gender}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{formatDate(dateOfBirth)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Father’s Name:</Text>
            <Text style={styles.value}>{fathersName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nationality:</Text>
            <Text style={styles.value}>{nationality}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Postal Address:</Text>
            <Text style={styles.value}>{postalAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Permanent Address:</Text>
            <Text style={styles.value}>{permanentAddress}</Text>
          </View>
        </View>

        {/* Education Table */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Education Qualification Details</Text>
          <View style={styles.table}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.headerRow]}>
              {tableHeader.map((cell, cellIndex) => (
                <Text key={cellIndex} style={styles.tableColHeader}>{cell}</Text>
              ))}
            </View>
            {/* Data Rows */}
            {tableRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tableRow}>
                {row.map((cell, cellIndex) => (
                  <Text key={cellIndex} style={styles.tableCol}>{cell}</Text>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Overall CGPA */}
        <View style={styles.row}>
          <Text style={styles.label}>Overall % or CGPA of the Candidate based on last result declared:</Text>
          <Text style={styles.value}>{overallCGPA}</Text>
        </View>

        {/* Declaration */}
        <View style={styles.declaration}>
          <Text>
            I <Text style={styles.label}>{name}</Text> hereby declare that the statement made in this application are true, complete and correct to the best of my knowledge and belief. I also ensure that during the internship I will follow
the institute rules and regulations. Consent of my parents for pursuing the Internship/Thesis work at Dr. B.R.
Ambedkar NIT Jalandhar is already taken by me.I understand that if any false information is found or if any required document is not uploaded, my internship application can be canceled at any time.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text>(Signature of the applicant)</Text>
          {signature && (
            <Image style={styles.image} src={signature} />
          )}
        </View>

        {/* Photo */}
        {photo && (
          <View style={styles.imagesRow}>
            <Text style={styles.label}>Photograph:</Text>
            <Image style={styles.image} src={photo} />
          </View>
        )}
      </Page>
    </Document>
  );
};

export default LTE2MonthApplicationPDF;