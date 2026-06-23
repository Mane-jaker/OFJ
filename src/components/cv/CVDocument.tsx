import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface CVExperience {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface CVDocumentProps {
  name: string;
  tailoredSummary: string;
  tailoredSkills: string[];
  tailoredExperience: CVExperience[];
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 4,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  experienceItem: {
    marginBottom: 8,
  },
  experienceHeader: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  experienceMeta: {
    fontSize: 10,
    marginBottom: 2,
  },
  bullet: {
    fontSize: 10,
    lineHeight: 1.4,
    marginLeft: 12,
  },
});

export function CVDocument({
  name,
  tailoredSummary,
  tailoredSkills,
  tailoredExperience,
}: CVDocumentProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{name}</Text>

        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summary}>{tailoredSummary}</Text>

        {tailoredSkills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skills}>{tailoredSkills.join(", ")}</Text>
          </>
        )}

        {tailoredExperience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {tailoredExperience.map((exp, idx) => (
              <View key={idx} style={styles.experienceItem} wrap={false}>
                <Text style={styles.experienceHeader}>{exp.title}</Text>
                <Text style={styles.experienceMeta}>
                  {exp.company} | {exp.dates}
                </Text>
                {exp.bullets.map((bullet, bidx) => (
                  <Text key={bidx} style={styles.bullet}>
                    {`• ${bullet}`}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
