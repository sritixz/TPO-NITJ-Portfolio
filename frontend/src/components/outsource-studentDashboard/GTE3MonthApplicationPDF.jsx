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
    padding: 40,
    fontSize: 11,
  },
  header: {
    fontSize: 11,
    marginBottom: 15,
  },
  headerLogo: {
    width: 70,
    height: 70,
  },
  headerTextContainer: {
    marginTop: 8,
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerAddress: {
    fontSize: 10,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  photoAffix: {
    position: 'absolute',
    top: 130, // Positioned just below the double line (adjusted for header height ~100px + margins)
    right: 40,
    width: 65,
    height: 85,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: 63,
    height: 83,
    objectFit: 'cover',
  },
  doubleLine: {
    marginBottom: 25,
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    textDecoration: 'underline',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  wrappedRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    width: 150, // Fixed width for labels to align values neatly
    flexShrink: 0,
  },
  value: {
    flex: 1,
    flexWrap: 'wrap',
  },
  checkboxRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    marginRight: 8,
    marginLeft: 8,
  },
  checked: {
    backgroundColor: '#000',
  },
  passportBox: {
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 10,
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  signature: {
    marginTop: 30,
    textAlign: 'right',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    borderTopStyle: 'solid',
    paddingTop: 15,
  },
  signatureText: {
    marginRight: 10,
    fontStyle: 'italic',
  },
  signatureImage: {
    width: 110,
    height: 45,
  },
});

const GTE3MonthApplicationPDF = ({ application }) => { 
  // Convert binary to base64 for react-pdf
  const uint8ToBase64 = (uint8Array, format) => {
    if (!uint8Array) return null;
    const binary = String.fromCharCode(...uint8Array);
    const mimeType = `image/${format}`;
    return `data:${mimeType};base64,${btoa(binary)}`;
  };

  const photoSrc = application.photo ? uint8ToBase64(application.photo.data, application.photo.format) : null;
  const signatureSrc = application.signature ? uint8ToBase64(application.signature.data, application.signature.format) : null;

  console.log('Component received - photo:', photoSrc ? 'base64 ready' : 'null');
  console.log('Component received - signature:', signatureSrc ? 'base64 ready' : 'null');

  const {
    homeUniversityName,
    homeUniversityAddress,
    durationFrom,
    durationTo,
    department,
    nonDegreeActivities,
    internshipType,
    ApplicantName,
    fathersName,
    mothersName,
    dateOfBirth,
    birthCity,
    birthCountry,
    nationality,
    maritalStatus,
    passportNo,
    passportIssueDate,
    passportIssuePlace,
    passportValidUpTo,
    correspondenceAddress,
    phone,
    email,
    hostelNeeded,
    facultySupervisor,
    facultySupervisorDepartment,
    degree,
    academicYear,
    academicSemester,
    languagesKnown,
  } = application;

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const languages = Array.isArray(languagesKnown) ? languagesKnown.join(', ') : languagesKnown || '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Photo Affix Below Double Line on Right */}
        <View fixed style={styles.photoAffix}>
          {photoSrc && <Image style={styles.image} src={photoSrc} />}
        </View>

        {/* Header with Logo on Left */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Image style={styles.headerLogo} source={Logo} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Dr B R Ambedkar National Institute of Technology, Jalandhar</Text>
              <Text style={styles.headerSubtitle}>(An Institute of National Importance under Ministry of Education, Govt. of India)</Text>
              <Text style={styles.headerAddress}>G T Road, Bye Pass, Jalandhar – 144008 (Punjab) India</Text>
            </View>
          </View>
        </View>

        {/* Double line after heading */}
        <View style={styles.doubleLine}>
          <Svg width={515} height={8}>
            <Line x1={0} y1={2} x2={520} y2={2} stroke="#000" strokeWidth={1} />
            <Line x1={0} y1={6} x2={520} y2={6} stroke="#000" strokeWidth={2} />
          </Svg>
        </View>


        {/* A. Personal Data */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>A. Personal Data of the Student</Text>
          <View style={styles.row}>
            <Text style={styles.label}>1. Name:</Text>
            <Text style={styles.value} wrap>{ApplicantName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>2. Father's Name:</Text>
            <Text style={styles.value} wrap>{fathersName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>3. Mother's Name:</Text>
            <Text style={styles.value} wrap>{mothersName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>4. Date of Birth:</Text>
            <Text style={styles.value}>{formatDate(dateOfBirth)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>5. City & Country of Birth:</Text>
            <Text style={styles.value}>{birthCity}, {birthCountry}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>6. Nationality:</Text>
            <Text style={styles.value}>{nationality}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>7. Marital Status:</Text>
            <Text style={styles.value}>{maritalStatus}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>8. Phone:</Text>
            <Text style={styles.value}>{phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>9. Email:</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
            <View style={styles.row}>
            <Text style={styles.label}>10. Languages Known:</Text>
            <Text style={styles.value} wrap>{languages}</Text>
          </View>
            <View style={styles.row}>
            <Text style={styles.label}>11. Correspondance Address:</Text>
            <Text style={styles.value} wrap>{correspondenceAddress}</Text>
          </View>
        </View>

        {/* B. Faculty Supervisor details */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>B. Faculty Supervisor & Internship details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>i. Faculty Supervisor at NIT Jalandhar:</Text>
            <Text style={styles.value} wrap>{facultySupervisor}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ii. Faculty Supervisor's Department:</Text>
            <Text style={styles.value} wrap>{facultySupervisorDepartment}</Text>
          </View>
            <View style={styles.row}>
            <Text style={styles.label}>iii. Internship Type:</Text>
            <Text style={styles.value} wrap>{internshipType}</Text>
          </View>
           <View style={styles.row}>
            <Text style={styles.label}>iv. Internship Duration:</Text>
            <Text style={styles.value}>From {formatDate(durationFrom)} To {formatDate(durationTo)}</Text>
          </View>
        </View>

        {/* C. Studies at Home University */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>C. Studies at Home University</Text>
          <View style={styles.row}>
            <Text style={styles.label}>i.Home University Name :</Text>
            <Text style={styles.value} wrap>{homeUniversityName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>ii.Home University Address :</Text>
            <Text style={styles.value} wrap>{homeUniversityAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>iii. Department:</Text>
            <Text style={styles.value} wrap>{department}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>iv. Course:</Text>
            <Text style={styles.value}>{degree}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>v. Academic Year:</Text>
            <Text style={styles.value}>{academicYear}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>vi. Academic Semester:</Text>
            <Text style={styles.value}>{academicSemester}</Text>
          </View>
        </View>

                  {/* Passport Details in Box */}
          <View style={styles.passportBox}>
            <View style={styles.row}>
              <Text style={styles.label}>9. Passport No.:</Text>
              <Text style={styles.value}>{passportNo}</Text>
              <Text style={[styles.label, { marginLeft: 20, width: 'auto' }]}>10. Date of Issue:</Text>
              <Text style={styles.value}>{formatDate(passportIssueDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>11. Place of Issue:</Text>
              <Text style={styles.value}>{passportIssuePlace}</Text>
              <Text style={[styles.label, { marginLeft: 20, width: 'auto' }]}>12. Valid up to:</Text>
              <Text style={styles.value}>{formatDate(passportValidUpTo)}</Text>
            </View>
          </View>
        <View style={styles.row}>
            <Text style={styles.label}>Intended activities during stay as non-degree student:</Text>
            <Text style={styles.value} wrap>{nonDegreeActivities}</Text>
        </View>

        <View style={styles.checkboxRow}>
  <Text style={styles.label}>
    Hostel Accommodation needed at NIT Jalandhar:
  </Text>
  <Text style={styles.value}>
    {hostelNeeded ? 'YES' : 'NO'}
  </Text>
</View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>(Signature of the Applicant)</Text>
          {signatureSrc && <Image style={styles.signatureImage} src={signatureSrc} />}
        </View>
      </Page>
    </Document>
  );
};

export default GTE3MonthApplicationPDF;