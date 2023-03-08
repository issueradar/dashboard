import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  Text,
} from '@chakra-ui/react';
import type { Project } from '@prisma/client';
import { Link } from '@/components';

export type ProjectCardProps = {
  project: Project;
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card maxW="sm">
      <CardHeader>
        <Link href={`/project/${project.id}`}>
          <Heading size="md">{project.name}</Heading>
        </Link>
        <Text fontSize="xs">{`${project.createdAt}`}</Text>
      </CardHeader>
      <CardBody>
        <Text>{project.description}</Text>
      </CardBody>
      <CardFooter>
        <Link href={`/project/${project.id}`}>View details</Link>
      </CardFooter>
    </Card>
  );
};
