import React, { type ComponentProps, useState } from 'react';

import { useLiveQuery } from 'loot-core/src/client/query-hooks';
import q from 'loot-core/src/shared/query';
import { type CategoryGroupEntity } from 'loot-core/src/types/models';

import useCategories from '../../hooks/useCategories';
import { DotsHorizontalTriple } from '../../icons/v1';
import Add from '../../icons/v1/Add';
import Trash from '../../icons/v1/Trash';
import NotesPaper from '../../icons/v2/NotesPaper';
import ViewHide from '../../icons/v2/ViewHide';
import ViewShow from '../../icons/v2/ViewShow';
import { type CSSProperties, styles, theme } from '../../style';
import { type CommonModalProps } from '../../types/modals';
import Button from '../common/Button';
import Menu from '../common/Menu';
import Modal from '../common/Modal';
import View from '../common/View';
import Notes from '../Notes';
import { Tooltip } from '../tooltips';

const BUTTON_HEIGHT = 40;

type CategoryGroupMenuProps = {
  modalProps: CommonModalProps;
  groupId: string;
  onSave: (group: CategoryGroupEntity) => void;
  onAddCategory: (groupId: string, isIncome: boolean) => void;
  onEditNotes: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onDelete: (groupId: string) => void;
  onClose?: () => void;
};

export default function CategoryGroupMenu({
  modalProps,
  groupId,
  onSave,
  onAddCategory,
  onEditNotes,
  onDelete,
  onClose,
}: CategoryGroupMenuProps) {
  const { grouped: categoryGroups } = useCategories();
  const group = categoryGroups.find(g => g.id === groupId);
  const data = useLiveQuery(
    () => q('notes').filter({ id: group.id }).select('*'),
    [group.id],
  );
  const originalNotes = data && data.length > 0 ? data[0].note : null;

  function _onClose() {
    modalProps?.onClose();
    onClose?.();
  }

  function _onRename(newName) {
    if (newName !== group.name) {
      onSave?.({
        ...group,
        name: newName,
      });
    }
  }

  function _onAddCategory() {
    onAddCategory?.(group.id, group.is_income);
  }

  function _onEditNotes() {
    onEditNotes?.(group.id);
  }

  function _onToggleVisibility() {
    onSave?.({
      ...group,
      hidden: !!!group.hidden,
    });
    _onClose();
  }

  function _onDelete() {
    onDelete?.(group.id);
  }

  function onNameUpdate(newName) {
    _onRename(newName);
  }

  const buttonStyle: CSSProperties = {
    ...styles.mediumText,
    borderRadius: 0,
    // Adjust based on desired number of buttons per row.
    flexBasis: '50%',
    height: BUTTON_HEIGHT,
    color: theme.formLabelText,
  };

  return (
    <Modal
      title={group.name}
      showHeader
      focusAfterClose={false}
      {...modalProps}
      onClose={_onClose}
      padding={0}
      style={{
        flex: 1,
        height: '45vh',
        padding: '0 10px',
        borderRadius: '6px',
      }}
      editableTitle={true}
      titleStyle={styles.underlinedText}
      onTitleUpdate={onNameUpdate}
      leftHeaderContent={
        <AdditionalCategoryGroupMenu
          group={group}
          onDelete={_onDelete}
          onToggleVisibility={_onToggleVisibility}
        />
      }
    >
      {() => (
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
          }}
        >
          <View
            style={{
              overflowY: 'auto',
              flex: 1,
            }}
          >
            <Notes
              notes={originalNotes?.length > 0 ? originalNotes : 'No notes'}
              editable={false}
              focused={false}
              getStyle={editable => ({
                ...styles.mediumText,
                borderRadius: 6,
                ...((!originalNotes || originalNotes.length === 0) && {
                  justifySelf: 'center',
                  alignSelf: 'center',
                  color: theme.pageTextSubdued,
                }),
              })}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignContent: 'space-between',
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <Button style={buttonStyle} onClick={_onAddCategory}>
              <Add width={17} height={17} style={{ paddingRight: 5 }} />
              Add category
            </Button>
            <Button style={buttonStyle} onClick={_onEditNotes}>
              <NotesPaper width={20} height={20} style={{ paddingRight: 5 }} />
              Edit notes
            </Button>
          </View>
        </View>
      )}
    </Modal>
  );
}

function AdditionalCategoryGroupMenu({ group, onDelete, onToggleVisibility }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemStyle: CSSProperties = {
    ...styles.mediumText,
    height: BUTTON_HEIGHT,
  };

  return (
    <View>
      <Button
        type="bare"
        aria-label="Menu"
        onClick={() => {
          setMenuOpen(true);
        }}
      >
        <DotsHorizontalTriple
          width={17}
          height={17}
          style={{ color: 'currentColor' }}
        />
        {menuOpen && (
          <Tooltip
            position="bottom-left"
            style={{ padding: 0 }}
            onClose={() => {
              setMenuOpen(false);
            }}
          >
            <Menu
              style={{
                ...styles.mediumText,
                color: theme.formLabelText,
              }}
              items={
                [
                  {
                    name: 'toggleVisibility',
                    text: group.hidden ? 'Show' : 'Hide',
                    icon: group.hidden ? ViewShow : ViewHide,
                    iconSize: 16,
                    style: itemStyle,
                  },
                  ...(!group.is_income && [
                    Menu.line,
                    {
                      name: 'delete',
                      text: 'Delete',
                      icon: Trash,
                      iconSize: 15,
                      style: itemStyle,
                    },
                  ]),
                ].filter(i => i != null) as ComponentProps<typeof Menu>['items']
              }
              onMenuSelect={itemName => {
                setMenuOpen(false);
                if (itemName === 'delete') {
                  onDelete();
                } else if (itemName === 'toggleVisibility') {
                  onToggleVisibility();
                }
              }}
            />
          </Tooltip>
        )}
      </Button>
    </View>
  );
}
