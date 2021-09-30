import Image from "next/image";
import Link from "next/link";
import Layout from "../../../../../../components/Layout";
import { EmptyState } from "../../../../../../components/EmptyState";
import { TrashIcon, DocumentAddIcon } from "@heroicons/react/outline";
import DropsSubnav from "../../../../../../components/DropsSubnav";
import Project, { Projects } from "../../../../../../models/project";
import Collection, { Collections } from "../../../../../../models/collection";
import ImageLayer, { ImageLayers } from "../../../../../../models/imageLayer";
import Trait, { Traits } from "../../../../../../models/trait";
import TraitValue, { TraitValues } from "../../../../../../models/traitValue";
import { GetServerSideProps } from "next";
import { DestructiveModal } from "../../../../../../components/DestructiveModal";
import { useState } from "react";
import { useRouter } from "next/router";

interface Props {
  project: Project;
  projects: Project[];
  collection: Collection;
  imageLayers: ImageLayer[];
  projectId: string;
  traits: Trait[];
  traitValuesDict: { [traitId: string]: TraitValue[] };
}

export default function IndexPage(props: Props) {
  const project = props.project;
  const projects = props.projects;
  const collection = props.collection;
  const imageLayers = props.imageLayers;
  const projectId = props.projectId;
  const traits = props.traits;
  const traitValuesDict = props.traitValuesDict;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageLayerIdToDelete, setImageLayerIdToDelete] = useState<
    string | null
  >(null);

  const router = useRouter();

  const confirmDeleteImageLayer = (
    event: React.MouseEvent,
    imageLayerId: string
  ) => {
    event.preventDefault();
    setImageLayerIdToDelete(imageLayerId);
    setDeleteModalOpen(true);
  };

  const deleteImageLayer = async () => {
    if (imageLayerIdToDelete) {
      await ImageLayers.remove(imageLayerIdToDelete, projectId, collection.id);
    }
    setImageLayerIdToDelete(null);
    setDeleteModalOpen(false);
    router.reload();
  };

  const cancelDeleteImageLayer = async () => {
    setImageLayerIdToDelete(null);
    setDeleteModalOpen(false);
  };

  const onChangeTraitId = async (traitId: string, imageLayerId: string) => {
    // START LOADING

    await ImageLayers.update(
      {
        traitId: traitId,
      },
      imageLayerId,
      projectId,
      collection.id
    );

    // STOP LOADING

    const traitValueElem = document.getElementById(
      imageLayerId + "-traitValue"
    );

    if (traitValueElem) {
      const nonNilOptions = traitValuesDict[traitId].map((traitValue) => {
        return `<option value=${traitValue.id}>${traitValue.name}</option>`;
      });
      traitValueElem.innerHTML =
        '<option key="-1" value="-1"></option>' + nonNilOptions.join();
    }
  };

  const onChangeTraitValueId = async (
    traitValueId: string,
    imageLayerId: string
  ) => {
    // START LOADING

    await ImageLayers.update(
      {
        traitValueId: traitValueId,
      },
      imageLayerId,
      projectId,
      collection.id
    );

    // STOP LOADING
  };

  if (!collection) {
    return (
      <Layout
        title="Artwork"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <DropsSubnav
          project={project}
          collection={collection}
          section="artwork"
        />
        <main className="px-8 py-12">
          <p>Not Found</p>
        </main>
      </Layout>
    );
  } else if (imageLayers.length == 0) {
    return (
      <Layout
        title="Artwork"
        section="collections"
        projects={projects}
        selectedProjectId={undefined}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="artwork"
          />
          <main className="px-8 py-12">
            <Link
              href={
                "/projects/" +
                project.id +
                "/collections/" +
                collection.id +
                "/artwork/create"
              }
              passHref={true}
            >
              <button type="button" className="block w-full">
                <EmptyState
                  title="No artwork"
                  message="Upload some layered artwork"
                  buttonTitle="New Artwork"
                />
              </button>
            </Link>
          </main>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout
        title="Artwork"
        section="collections"
        projects={projects}
        selectedProjectId={projectId}
      >
        <div>
          <DropsSubnav
            project={project}
            collection={collection}
            section="artwork"
          />
          <main>
            <div className="mt-4 mr-8 float-right">
              <span className="">
                <Link
                  href={
                    "/projects/" +
                    project.id +
                    "/collections/" +
                    collection.id +
                    "/artwork/create"
                  }
                  passHref={true}
                >
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <DocumentAddIcon
                      className="-ml-1 mr-1 h-5 w-5"
                      aria-hidden="true"
                    />
                    Add Artwork
                  </button>
                </Link>
              </span>
            </div>

            <ul
              role="list"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 clear-both px-8 py-4"
            >
              {imageLayers.map((imageLayer) => (
                <li key={imageLayer.id} className="relative">
                  <Link
                    href={
                      "/projects/" +
                      project.id +
                      "/collections/" +
                      collection.id +
                      "/artwork/" +
                      imageLayer.id +
                      "/edit"
                    }
                    passHref={true}
                  >
                    <div className="block group w-full aspect-w-10 aspect-h-10 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                      <Image
                        src={imageLayer.url}
                        unoptimized
                        alt=""
                        className="object-cover pointer-events-none group-hover:opacity-75"
                        layout="fill"
                      />
                      <button
                        type="button"
                        className="absolute inset-0 focus:outline-none"
                      >
                        <span className="sr-only">
                          View details for {imageLayer.name}
                        </span>
                      </button>
                    </div>
                  </Link>
                  <a
                    href="#"
                    onClick={(e) => confirmDeleteImageLayer(e, imageLayer.id)}
                    className="mt-2 text-indigo-600 hover:text-indigo-900 inline-block float-right"
                  >
                    <TrashIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </a>
                  <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">
                    {imageLayer.name}
                  </p>
                  <p className="block text-sm font-medium text-gray-500 pointer-events-none">
                    {ImageLayers.formatBytes(imageLayer.bytes)}
                  </p>
                  <br />
                  <div>
                    <label
                      htmlFor="trait"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Associated Trait
                    </label>
                    <select
                      id={imageLayer.id + "-trait"}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      defaultValue={imageLayer.traitId ?? "-1"}
                      onChange={(e) => {
                        const { value } = e.currentTarget;
                        const traitId = value.toString();
                        if (traitId) {
                          onChangeTraitId(traitId, imageLayer.id);
                        }
                      }}
                    >
                      <option value="-1">Unassigned</option>
                      {traits.map((trait) => (
                        <option key={trait.id} value={trait.id}>
                          {trait.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="traitValue"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Associated Trait Value
                    </label>
                    <select
                      id={imageLayer.id + "-traitValue"}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      defaultValue={imageLayer.traitValueId ?? ""}
                      onChange={(e) => {
                        const { value } = e.currentTarget;
                        const traitValueId = value.toString();
                        if (traitValueId) {
                          onChangeTraitValueId(traitValueId, imageLayer.id);
                        }
                      }}
                    >
                      <option key={"-1"} value="-1"></option>
                      {(imageLayer.traitId
                        ? traitValuesDict[imageLayer.traitId]
                        : []
                      ).map((traitValue) => (
                        <option key={traitValue.id} value={traitValue.id}>
                          {traitValue.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          </main>

          <DestructiveModal
            title="Delete Artwork"
            message={
              "Are you sure you want to delete ‘" +
              (imageLayers.find((file) => file.id == imageLayerIdToDelete)
                ?.name ?? "Unknown") +
              "’? This action cannot be undone."
            }
            deleteAction={() => {
              deleteImageLayer();
            }}
            cancelAction={() => {
              cancelDeleteImageLayer();
            }}
            show={deleteModalOpen}
          />
        </div>
      </Layout>
    );
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const projectId = context.query.projectId?.toString();
    const collectionId = context.query.collectionId?.toString();

    if (projectId && collectionId) {
      const projects = await Projects.all();
      const collection = await Collections.withId(collectionId, projectId);
      const imageLayers = await ImageLayers.all(projectId, collectionId);
      const project = projects.find((project) => project.id == projectId);
      const traits = await Traits.all(projectId, collectionId, "name");
      const traitValuesDict: { [traitId: string]: TraitValue[] } = {};
      for (let i = 0; i < traits.length; i++) {
        const trait = traits[i];
        const traitValues = await TraitValues.all(
          projectId,
          collectionId,
          trait.id
        );
        traitValuesDict[trait.id] = traitValues;
      }

      return {
        props: {
          project: project,
          projects: projects,
          collection: collection,
          imageLayers: imageLayers,
          projectId: projectId,
          traits: traits,
          traitValuesDict: traitValuesDict,
        },
      };
    }
  } catch (error) {
    console.log("Error: ", error);
  }

  return {
    props: {},
  };
};
