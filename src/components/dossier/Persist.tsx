import Section from './Section';
import Tilt from '@/components/motion/Tilt';
import { useContent } from '@/content/ContentProvider';

const Persist = () => {
  const { achievements, certifications, profile } = useContent();
  return (
  <Section id="persist">
    <ul className="space-y-10">
      {achievements.map((a) => (
        <li key={a.title} className="measure">
          <Tilt max={4} className="-m-4 rounded-lg p-4">
            <h3 className="text-xl font-bold">{a.title}</h3>
            <p className="mt-2 text-muted-foreground">{a.text}</p>
          </Tilt>
        </li>
      ))}
    </ul>

    <div className="mt-16 grid gap-10 border-t border-border pt-10 md:grid-cols-2">
      <div>
        <h3 className="font-semibold">Certifications</h3>
        <ul className="mt-4 space-y-3">
          {certifications.map((c) => (
            <li key={c.short} className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <span>
                <span className="font-semibold">{c.short}</span>
                <span className="ml-2 text-muted-foreground">{c.name}</span>
              </span>
              <span className={`shrink-0 text-sm ${c.status === 'earned' ? 'text-signal' : 'text-muted-foreground'}`}>
                {c.status === 'earned' ? 'Earned' : 'In progress'}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold">Education</h3>
        <p className="mt-4 text-lg">{profile.education.degree}</p>
        <p className="text-muted-foreground">{profile.education.school}</p>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {profile.education.years}, CGPA {profile.education.cgpa}
        </p>
      </div>
    </div>
  </Section>
  );
};

export default Persist;
